import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/data/cache";
import { fetchFundReport } from "@/lib/data/providers/mfapi";
import mfSchemes from "@/data/mf-schemes.json";

type MFScheme = { schemeCode: number; name: string; fundHouse: string; category: string; isEtf?: true };

const FUND_CACHE_PREFIX = "wiq:fund:";
const FUND_TTL          = 60 * 60 * 6; // 6 h — NAV updates once daily

const ratelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "wiq:rl" })
  : null;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ schemeCode: string }> },
) {
  if (ratelimit) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const { schemeCode: raw } = await params;
  const code = Number(raw);
  if (isNaN(code)) return NextResponse.json({ error: "Invalid scheme code" }, { status: 400 });

  const scheme = (mfSchemes as MFScheme[]).find((s) => s.schemeCode === code);
  if (!scheme) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });

  const cacheKey = `${FUND_CACHE_PREFIX}${code}`;

  // Cache hit
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const report = await fetchFundReport(code, {
      name:      scheme.name,
      fundHouse: scheme.fundHouse,
      category:  scheme.category,
      isEtf:     !!scheme.isEtf,
    });

    if (redis) await redis.set(cacheKey, report, { ex: FUND_TTL });

    return NextResponse.json(report, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch fund data", detail: message }, { status: 502 });
  }
}
