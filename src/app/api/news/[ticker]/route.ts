import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/data/cache";
import symbols from "@/data/symbols.json";
import Parser from "rss-parser";

const rss = new Parser({ timeout: 8000 });

type SymbolEntry = { ticker: string; exchange: string };

export interface NewsItem {
  uuid:        string;
  title:       string;
  publisher:   string;
  link:        string;
  publishedAt: number;   // Unix seconds
  summary?:    string;
}

const THREE_MONTHS = 90 * 24 * 60 * 60; // seconds

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
  const ticker   = raw.toUpperCase();
  const cacheKey = `wiq:news2:${ticker}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  try {
    const yahooTicker = getYahooTicker(ticker);
    const cutoff      = Math.floor(Date.now() / 1000) - THREE_MONTHS;

    // Yahoo Finance RSS — ticker-specific news
    const feedUrl = `https://finance.yahoo.com/rss/headline?s=${yahooTicker}`;
    const feed    = await rss.parseURL(feedUrl);

    const items: NewsItem[] = (feed.items ?? [])
      .filter((item) => {
        if (!item.title || !item.link) return false;
        const ts = item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : 0;
        return ts >= cutoff;
      })
      .map((item) => ({
        uuid:        item.guid ?? item.link ?? item.title ?? "",
        title:       item.title ?? "",
        publisher:   item.creator ?? feed.title ?? "Yahoo Finance",
        link:        item.link ?? "",
        publishedAt: item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : 0,
        summary:     item.contentSnippet?.slice(0, 200) ?? undefined,
      }))
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .slice(0, 25);

    if (redis && items.length > 0) await redis.set(cacheKey, items, { ex: 60 * 30 });

    return NextResponse.json(items, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: "Failed to fetch news", detail: msg }, { status: 502 });
  }
}
