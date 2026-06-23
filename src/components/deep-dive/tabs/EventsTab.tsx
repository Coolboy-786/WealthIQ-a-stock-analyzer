"use client";

import { useEffect, useState } from "react";
import { Calendar, Scissors, IndianRupee } from "lucide-react";
import type { CorporateEvent } from "@/app/api/events/[ticker]/route";
import { cn } from "@/lib/utils";

const EVENT_CONFIG = {
  dividend: {
    label: "Dividend",
    Icon:  IndianRupee,
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    icon:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  split: {
    label: "Stock Split",
    Icon:  Scissors,
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    icon:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
} as const;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(yyyy: string): string {
  const [y, m, d] = yyyy.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function groupByYear(events: CorporateEvent[]): [string, CorporateEvent[]][] {
  const map = new Map<string, CorporateEvent[]>();
  for (const e of events) {
    const yr = e.date.slice(0, 4);
    if (!map.has(yr)) map.set(yr, []);
    map.get(yr)!.push(e);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

interface Props { ticker: string; companyName: string }

export function EventsTab({ ticker, companyName }: Props) {
  const [events,  setEvents]  = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch(`/api/events/${ticker}`)
      .then((r) => r.json())
      .then((json) => Array.isArray(json) ? setEvents(json) : setError(true))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ticker]);

  const grouped   = groupByYear(events);
  const divCount  = events.filter((e) => e.type === "dividend").length;
  const splitCount = events.filter((e) => e.type === "split").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-0.5 text-sm font-semibold text-slate-200">Corporate Events</h3>
          <p className="text-xs text-slate-600">Last 10 years · Dividends &amp; splits · Yahoo Finance</p>
        </div>
        {!loading && !error && events.length > 0 && (
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-500">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Type legend */}
      {!loading && !error && events.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {divCount > 0 && (
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", EVENT_CONFIG.dividend.badge)}>
              Dividend · {divCount}
            </span>
          )}
          {splitCount > 0 && (
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", EVENT_CONFIG.split.badge)}>
              Stock Split · {splitCount}
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
            <p className="text-xs text-slate-600">Loading corporate events…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
          <p className="text-xs text-slate-600">Could not load events for {companyName}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-slate-900/40">
          <Calendar className="h-6 w-6 text-slate-700" strokeWidth={1.5} />
          <p className="text-xs text-slate-600">No events found for {ticker} in the last 10 years</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && events.length > 0 && (
        <div className="space-y-6">
          {grouped.map(([year, yearEvents]) => (
            <div key={year}>
              {/* Year divider */}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">{year}</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <div className="space-y-2">
                {yearEvents.map((evt, i) => {
                  const cfg  = EVENT_CONFIG[evt.type];
                  const Icon = cfg.Icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      {/* Icon */}
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", cfg.icon)}>
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", cfg.badge)}>
                            {cfg.label}
                          </span>
                          <span className="text-sm font-semibold text-slate-200">
                            {evt.type === "dividend" && evt.amount != null && `₹${evt.amount} per share`}
                            {evt.type === "split" && evt.ratio && `${evt.ratio} ratio`}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <span className="shrink-0 text-xs text-slate-500">{fmtDate(evt.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="space-y-1 text-[10px] text-slate-700">
        <p>Dividend and split data sourced from Yahoo Finance. Bonus issues, buybacks, and rights offerings are not available from this source.</p>
        <p>For complete corporate action history, refer to NSE India (nseindia.com) or BSE India (bseindia.com).</p>
      </div>
    </div>
  );
}
