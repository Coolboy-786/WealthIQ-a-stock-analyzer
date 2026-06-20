import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";

import YahooFinanceClass from "yahoo-finance2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey", "ripHistorical"] }) as any;

type SymbolEntry = { ticker: string; exchange: string };

export interface TechBar {
  time:   string;   // "YYYY-MM-DD"
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

const toYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function safe(v: unknown, fallback = 0): number {
  return typeof v === "number" && isFinite(v) ? parseFloat(v.toFixed(2)) : fallback;
}

function getYahooTicker(ticker: string): string {
  const sym = (symbols as SymbolEntry[]).find((s) => s.ticker === ticker);
  const exchange = (sym?.exchange as "NSE" | "BSE") ?? "NSE";
  return exchange === "NSE" ? `${ticker}.NS` : `${ticker}.BO`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker: raw } = await params;
  const ticker = raw.toUpperCase();
  const cacheKey = `wiq:tech:${ticker}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const symbol  = getYahooTicker(ticker);
    const period2 = new Date();
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 3); // 3Y daily for SMA200 headroom

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw2 = await yf.chart(symbol, { interval: "1d", period1, period2 }, { validateResult: false }) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes: any[] = raw2?.quotes ?? [];

    const bars: TechBar[] = quotes
      .filter((q) => q?.close != null && q?.open != null)
      .map((q) => ({
        time:   toYYYYMMDD(new Date(q.date)),
        open:   safe(q.open),
        high:   safe(q.high),
        low:    safe(q.low),
        close:  safe(q.close),
        volume: safe(q.volume),
      }));

    if (redis && bars.length > 0) await redis.set(cacheKey, bars, { ex: 60 * 60 * 6 });
    return NextResponse.json(bars, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: "Failed", detail: msg }, { status: 502 });
  }
}
