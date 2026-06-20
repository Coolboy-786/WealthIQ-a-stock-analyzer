"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Newspaper, Clock } from "lucide-react";
import type { NewsItem } from "@/app/api/news/[ticker]/route";

function timeAgo(unix: number): string {
  if (!unix) return "—";
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unix * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function publisherInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const PUBLISHER_COLORS: Record<string, string> = {
  "Reuters":           "bg-orange-500/20 text-orange-300",
  "Bloomberg":         "bg-blue-500/20   text-blue-300",
  "Economic Times":    "bg-red-500/20    text-red-300",
  "Mint":              "bg-emerald-500/20 text-emerald-300",
  "Business Standard": "bg-violet-500/20 text-violet-300",
  "CNBC":              "bg-blue-500/20   text-blue-300",
  "Moneycontrol":      "bg-cyan-500/20   text-cyan-300",
  "Financial Express": "bg-amber-500/20  text-amber-300",
  "Motley Fool":       "bg-indigo-500/20 text-indigo-300",
};

function publisherColor(name: string): string {
  for (const [key, cls] of Object.entries(PUBLISHER_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return "bg-slate-500/20 text-slate-300";
}

interface Props { ticker: string; companyName: string }

export function NewsTab({ ticker, companyName }: Props) {
  const [news,    setNews]    = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch(`/api/news/${ticker}`)
      .then((r) => r.json())
      .then((json) => Array.isArray(json) ? setNews(json) : setError(true))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ticker]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-0.5 text-sm font-semibold text-slate-200">News</h3>
          <p className="text-xs text-slate-600">Last 3 months · Yahoo Finance RSS · {ticker}-specific</p>
        </div>
        {!loading && !error && news.length > 0 && (
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-500">
            {news.length} article{news.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
            <p className="text-xs text-slate-600">Fetching latest news…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
          <p className="text-xs text-slate-600">Could not load news for {companyName}</p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-slate-900/40">
          <Newspaper className="h-6 w-6 text-slate-700" strokeWidth={1.5} />
          <p className="text-xs text-slate-600">No news found for {ticker} in the last 3 months</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="divide-y divide-white/[0.04] overflow-hidden rounded-xl border border-white/[0.06] bg-slate-900/40">
          {news.map((item) => (
            <a
              key={item.uuid}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3.5 p-4 transition-colors duration-100 hover:bg-white/[0.03]"
            >
              {/* Publisher initials badge */}
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${publisherColor(item.publisher)}`}>
                {publisherInitials(item.publisher)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-medium leading-snug text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                  {item.title}
                </p>
                {item.summary && (
                  <p className="mb-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">{item.summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${publisherColor(item.publisher)}`}>
                    {item.publisher}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                    {timeAgo(item.publishedAt)}
                  </span>
                </div>
              </div>

              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-700 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
            </a>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-700">
        News sourced from Yahoo Finance RSS ({ticker}.NS/{ticker}.BO). Articles link to third-party sites. WealthIQ does not endorse external content.
      </p>
    </div>
  );
}
