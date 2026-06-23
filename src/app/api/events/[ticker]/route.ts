import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from "yahoo-finance2";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey"] }) as any;

type SymbolEntry = { ticker: string; exchange: string };

export interface CorporateEvent {
  type: "dividend" | "split";
  date: string; // YYYY-MM-DD
  amount?: number; // INR per share (dividends only)
  ratio?: string;  // e.g. "1:10" (splits only)
}

const toYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function getExchange(ticker: string): "NSE" | "BSE" {
  const sym = (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
  return (sym?.exchange as "NSE" | "BSE") ?? "NSE";
}

function toYahooTicker(ticker: string, exchange: "NSE" | "BSE") {
  return exchange === "NSE" ? `${ticker}.NS` : `${ticker}.BO`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();
  const cacheKey = `wiq:events:${ticker}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const exchange = getExchange(ticker);
    const symbol   = toYahooTicker(ticker, exchange);
    const period1  = new Date();
    period1.setFullYear(period1.getFullYear() - 10);
    const period2  = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await yf.chart(
      symbol,
      { interval: "1mo", period1, period2 },
      { validateResult: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    const events: CorporateEvent[] = [];

    // Dividends
    const rawDivs = result?.events?.dividends ?? {};
    for (const val of Object.values(rawDivs) as { amount: number; date: Date | number }[]) {
      if (!val?.date) continue;
      events.push({
        type:   "dividend",
        date:   toYYYYMMDD(val.date instanceof Date ? val.date : new Date((val.date as number) * 1000)),
        amount: parseFloat((val.amount ?? 0).toFixed(2)),
      });
    }

    // Splits
    const rawSplits = result?.events?.splits ?? {};
    for (const val of Object.values(rawSplits) as { date: Date | number; numerator: number; denominator: number; splitRatio?: string }[]) {
      if (!val?.date) continue;
      events.push({
        type:  "split",
        date:  toYYYYMMDD(val.date instanceof Date ? val.date : new Date((val.date as number) * 1000)),
        ratio: val.splitRatio ?? `${val.numerator}:${val.denominator}`,
      });
    }

    events.sort((a, b) => b.date.localeCompare(a.date));

    if (redis && events.length > 0) await redis.set(cacheKey, events, { ex: 60 * 60 * 12 });

    return NextResponse.json(events, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch events", detail: msg }, { status: 502 });
  }
}
