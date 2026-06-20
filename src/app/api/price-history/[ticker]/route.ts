import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from "yahoo-finance2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey"] }) as any;

type SymbolEntry = { ticker: string; exchange: string };
type Period = "1d" | "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y";

// time: "YYYY-MM-DD" for daily+, Unix seconds (number) for intraday
export interface PriceBar {
  time:   string | number;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

const toYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PERIOD_CONFIG: Record<Period, {
  interval: "60m" | "1d" | "1wk" | "1mo";
  daysBack: number;
  intraday: boolean;
}> = {
  "1d": { interval: "60m", daysBack: 2,    intraday: true  },
  "1w": { interval: "1d",  daysBack: 7,    intraday: false },
  "1m": { interval: "1d",  daysBack: 30,   intraday: false },
  "3m": { interval: "1d",  daysBack: 90,   intraday: false },
  "6m": { interval: "1wk", daysBack: 180,  intraday: false },
  "1y": { interval: "1wk", daysBack: 365,  intraday: false },
  "3y": { interval: "1mo", daysBack: 1095, intraday: false },
  "5y": { interval: "1mo", daysBack: 1825, intraday: false },
};

function getExchange(ticker: string): "NSE" | "BSE" {
  const sym = (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
  return (sym?.exchange as "NSE" | "BSE") ?? "NSE";
}

function toYahooTicker(ticker: string, exchange: "NSE" | "BSE") {
  return exchange === "NSE" ? `${ticker}.NS` : `${ticker}.BO`;
}

function safe(v: unknown, fallback = 0): number {
  return typeof v === "number" && isFinite(v) ? parseFloat(v.toFixed(2)) : fallback;
}

async function fetchHistory(symbol: string, cfg: typeof PERIOD_CONFIG[Period]): Promise<PriceBar[]> {
  const period2 = new Date();
  const period1 = new Date();
  period1.setDate(period1.getDate() - cfg.daysBack);

  if (cfg.intraday) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yf.chart(symbol, { interval: cfg.interval, period1, period2 }, { validateResult: false }) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes: any[] = result?.quotes ?? [];
    return quotes
      .filter((q) => q?.close != null && q?.open != null)
      .map((q) => ({
        time:   Math.floor(new Date(q.date).getTime() / 1000), // Unix seconds UTC
        open:   safe(q.open),
        high:   safe(q.high),
        low:    safe(q.low),
        close:  safe(q.close),
        volume: safe(q.volume),
      }));
  } else {
    const result = await yf.historical(
      symbol,
      { interval: cfg.interval as "1d" | "1wk" | "1mo", period1, period2 },
      { validateResult: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any[];
    return result
      .filter((q) => q?.close != null)
      .map((q) => ({
        time:   toYYYYMMDD(new Date(q.date)),
        open:   safe(q.open ?? q.close),
        high:   safe(q.high ?? q.close),
        low:    safe(q.low  ?? q.close),
        close:  safe(q.adjClose ?? q.close),
        volume: safe(q.volume),
      }));
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker: rawTicker } = await params;
  const ticker  = rawTicker.toUpperCase();
  const period  = (req.nextUrl.searchParams.get("period") ?? "1y") as Period;

  if (!(period in PERIOD_CONFIG)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const cacheKey = `wiq:ph:${ticker}:${period}`;
  const cacheTTL = period === "1d" ? 60 * 15 : 60 * 60 * 6;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const exchange = getExchange(ticker);
    const symbol   = toYahooTicker(ticker, exchange);
    const points   = await fetchHistory(symbol, PERIOD_CONFIG[period]);

    if (redis && points.length > 0) await redis.set(cacheKey, points, { ex: cacheTTL });

    return NextResponse.json(points, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch price history", detail: msg }, { status: 502 });
  }
}
