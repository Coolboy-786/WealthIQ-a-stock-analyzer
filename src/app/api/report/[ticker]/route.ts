import { NextRequest, NextResponse } from "next/server";
import { yahooProvider } from "@/lib/data/providers/yahoo";
import { computeReport } from "@/lib/rules-engine";
import { generateNarratives, mergeNarratives } from "@/lib/narrative/generate";
import { memoryCache } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";

type SymbolEntry = { ticker: string; exchange: string };

function getExchange(ticker: string): "NSE" | "BSE" {
  const sym = (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
  return (sym?.exchange as "NSE" | "BSE") ?? "NSE";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const upper = ticker.toUpperCase();
  const exchange = getExchange(upper);
  const cacheKey = `${upper}:live`;

  // Cache hit
  const cached = await memoryCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const raw        = await yahooProvider.fetch(upper, exchange);
    const scored     = computeReport(raw);
    const narratives = await generateNarratives(scored);
    const final      = mergeNarratives(scored, narratives);

    await memoryCache.set(cacheKey, final, 60 * 60 * 4); // 4h TTL

    return NextResponse.json(final, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch report", detail: message },
      { status: 502 },
    );
  }
}
