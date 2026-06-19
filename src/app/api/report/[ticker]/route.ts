import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { yahooProvider } from "@/lib/data/providers/yahoo";
import { computeReport } from "@/lib/rules-engine";
import { generateNarratives, mergeNarratives } from "@/lib/narrative/generate";
import { reportCache, redis } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";

type SymbolEntry = { ticker: string; exchange: string };

function getExchange(ticker: string): "NSE" | "BSE" {
  const sym = (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
  return (sym?.exchange as "NSE" | "BSE") ?? "NSE";
}

// 20 requests per IP per minute — only enforced when Redis is available
const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix:  "wiq:rl",
    })
  : null;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  // Rate limit
  if (ratelimit) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
    const { success, limit, remaining } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit":     String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "Retry-After":           "60",
          },
        },
      );
    }
  }

  const { ticker } = await params;
  const upper      = ticker.toUpperCase();
  const exchange   = getExchange(upper);
  const cacheKey   = `${upper}:live`;

  // Cache hit
  const cached = await reportCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const raw        = await yahooProvider.fetch(upper, exchange);
    const scored     = computeReport(raw);
    const narratives = await generateNarratives(scored);
    const final      = mergeNarratives(scored, narratives);

    await reportCache.set(cacheKey, final, 60 * 60 * 4);

    return NextResponse.json(final, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch report", detail: message },
      { status: 502 },
    );
  }
}
