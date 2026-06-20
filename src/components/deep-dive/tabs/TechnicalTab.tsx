"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import type { SnapshotTab } from "@/types/report";
import type { TechBar } from "@/app/api/technical/[ticker]/route";
import { TechnicalChart } from "@/components/deep-dive/TechnicalChart";
import { cn } from "@/lib/utils";

const INDICATORS = [
  {
    key:   "rsi",
    label: "RSI (14)",
    dot:   "bg-purple-400",
    border: "border-purple-500/30 hover:border-purple-500/60",
    bg:    "bg-purple-500/[0.05]",
    activeBorder: "border-purple-500/60",
    body:  "Relative Strength Index measures the speed and magnitude of recent price changes on a 0–100 scale. Values near the extremes indicate the price has moved sharply in one direction — useful context for understanding momentum, not a signal to act.",
  },
  {
    key:   "macd",
    label: "MACD 12/26/9",
    dot:   "bg-blue-400",
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg:    "bg-blue-500/[0.05]",
    activeBorder: "border-blue-500/60",
    body:  "Moving Average Convergence Divergence tracks the relationship between two exponential moving averages. The histogram shows how far apart the MACD line and its signal line are — wider bars indicate stronger momentum in that direction.",
  },
  {
    key:   "ma",
    label: "Moving Averages",
    dot:   "bg-orange-400",
    border: "border-orange-500/30 hover:border-orange-500/60",
    bg:    "bg-orange-500/[0.05]",
    activeBorder: "border-orange-500/60",
    body:  "MA 20 / MA 50 / MA 200 smooth out price noise by averaging closing prices over their respective periods. Widely-used as context for identifying trend direction. EMA 20 gives more weight to recent prices than SMA 20.",
  },
  {
    key:   "bb",
    label: "Bollinger Bands (20,2)",
    dot:   "bg-slate-400",
    border: "border-slate-500/30 hover:border-slate-500/60",
    bg:    "bg-slate-500/[0.05]",
    activeBorder: "border-slate-500/60",
    body:  "Three bands: a 20-period SMA in the middle, with upper and lower bands at ±2 standard deviations. Band width reflects volatility — they widen during volatile periods and narrow during calmer ones.",
  },
] as const;

type IndicatorKey = typeof INDICATORS[number]["key"];

export function TechnicalTab({ data }: { data: SnapshotTab }) {
  const [active,  setActive]  = useState<IndicatorKey | null>(null);
  const [bars,    setBars]    = useState<TechBar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);
  const [fetched, setFetched] = useState(false);

  function handleClick(key: IndicatorKey) {
    if (active === key) { setActive(null); return; }
    setActive(key);
    if (fetched) return;
    setLoading(true); setError(false);
    fetch(`/api/technical/${data.ticker}`)
      .then((r) => r.json())
      .then((json) => { Array.isArray(json) ? setBars(json) : setError(true); setFetched(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-0.5 text-sm font-semibold text-slate-200">Technical Analysis</h3>
        <p className="text-xs text-slate-600">Click an indicator to view its chart</p>
      </div>

      {/* Indicator cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {INDICATORS.map((ind) => {
          const isActive = active === ind.key;
          return (
            <button
              key={ind.key}
              onClick={() => handleClick(ind.key)}
              className={cn(
                "group w-full rounded-xl border p-4 text-left transition-all duration-150",
                ind.bg,
                isActive ? ind.activeBorder : ind.border,
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", ind.dot)} />
                  <span className="text-xs font-semibold text-slate-200">{ind.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 text-slate-600 transition-transform duration-150",
                  isActive && "rotate-90 text-slate-400",
                )} />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">{ind.body}</p>
            </button>
          );
        })}
      </div>

      {/* Chart — shown when any indicator is active */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {/* Header row */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  {INDICATORS.find((i) => i.key === active)?.label} · {data.ticker}
                </p>
                <button
                  onClick={() => setActive(null)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-white/[0.04] hover:text-slate-400 transition-colors"
                >
                  <X className="h-3 w-3" /> Close chart
                </button>
              </div>

              {loading ? (
                <div className="flex h-[540px] items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
                    <p className="text-xs text-slate-600">Fetching 3Y price history…</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
                  <p className="text-xs text-slate-600">Could not load price data for {data.ticker}</p>
                </div>
              ) : bars.length > 0 ? (
                <TechnicalChart bars={bars} ticker={data.ticker} exchange={data.exchange} focusIndicator={active} />
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-slate-700">
        Technical indicators are lagging measures derived from historical price data. They describe what has happened, not what will happen. WealthIQ does not make buy, sell, or hold recommendations.
      </p>
    </div>
  );
}
