"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, CandlestickChart, TrendingUp, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Period    = "1d" | "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y";
type ChartType = "line" | "candle";

interface PriceBar {
  time:   string | number;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

interface OHLCDisplay { o: number; h: number; l: number; c: number }

const PERIODS: { key: Period; label: string }[] = [
  { key: "1d", label: "1D" }, { key: "1w", label: "1W" }, { key: "1m", label: "1M" },
  { key: "3m", label: "3M" }, { key: "6m", label: "6M" }, { key: "1y", label: "1Y" },
  { key: "3y", label: "3Y" }, { key: "5y", label: "5Y" },
];

const fmt = (v: number) =>
  v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function mountChart(
  el: HTMLDivElement,
  bars: PriceBar[],
  type: ChartType,
  showVolume: boolean,
  height: number,
  onCrosshair: (d: OHLCDisplay | null) => void,
): Promise<() => void> {
  const { createChart, CandlestickSeries, LineSeries, HistogramSeries, ColorType } =
    await import("lightweight-charts");

  const chart = createChart(el, {
    width:  el.clientWidth,
    height,
    layout: {
      background: { type: ColorType.Solid, color: "#0F172A" },
      textColor:  "#64748B",
      fontSize:   11,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: "rgba(255,255,255,0.04)" },
    },
    crosshair:       { mode: 1 },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: { top: 0.08, bottom: showVolume ? 0.28 : 0.04 },
    },
    leftPriceScale: { visible: false },
    timeScale:      { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let priceSeries: any;
  if (type === "candle") {
    priceSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981", downColor: "#EF4444",
      borderUpColor: "#10B981", borderDownColor: "#EF4444",
      wickUpColor:   "#10B981", wickDownColor:   "#EF4444",
    });
    priceSeries.setData(bars.map((d) => ({
      time: d.time as never,
      open: d.open, high: d.high, low: d.low, close: d.close,
    })));
  } else {
    priceSeries = chart.addSeries(LineSeries, {
      color: "#3B82F6", lineWidth: 2,
      crosshairMarkerVisible: true, crosshairMarkerRadius: 4,
      lastValueVisible: false, priceLineVisible: false,
    });
    priceSeries.setData(bars.map((d) => ({ time: d.time as never, value: d.close })));
  }

  if (showVolume) {
    const vs = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }, priceScaleId: "vol",
      lastValueVisible: false, priceLineVisible: false,
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
    vs.setData(bars.map((d) => ({
      time:  d.time as never,
      value: d.volume,
      color: d.close >= d.open ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)",
    })));
  }

  chart.timeScale().fitContent();

  chart.subscribeCrosshairMove((param) => {
    if (!param.point || !param.time || !param.seriesData.size) { onCrosshair(null); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bar = param.seriesData.get(priceSeries) as any;
    if (!bar) return;
    onCrosshair({ o: bar.open ?? bar.value, h: bar.high ?? bar.value, l: bar.low ?? bar.value, c: bar.close ?? bar.value });
  });

  const ro = new ResizeObserver(() => chart.applyOptions({ width: el.clientWidth }));
  ro.observe(el);
  return () => { ro.disconnect(); chart.remove(); };
}

// ── Shared controls bar ────────────────────────────────────────────────────────
function Controls({
  period, setPeriod, chartType, setType, showVolume, setVolume, tvUrl,
  maximized, onToggleMax,
}: {
  period: Period; setPeriod: (p: Period) => void;
  chartType: ChartType; setType: (t: ChartType) => void;
  showVolume: boolean; setVolume: (v: boolean) => void;
  tvUrl: string; maximized: boolean; onToggleMax: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-0.5">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors duration-100",
              period === key
                ? "bg-blue-500/20 text-blue-400"
                : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setType("line")}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            chartType === "line"
              ? "bg-blue-500/20 text-blue-400"
              : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400",
          )}
        >
          <TrendingUp className="h-3 w-3" strokeWidth={2} /> Line
        </button>
        <button
          onClick={() => setType("candle")}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            chartType === "candle"
              ? "bg-blue-500/20 text-blue-400"
              : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400",
          )}
        >
          <CandlestickChart className="h-3 w-3" strokeWidth={2} /> Candle
        </button>

        <button
          onClick={() => setVolume(!showVolume)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
            showVolume
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-white/[0.06] text-slate-600 hover:border-white/[0.10] hover:text-slate-400",
          )}
        >
          <span className={cn(
            "inline-block h-2.5 w-2.5 rounded-sm border transition-colors",
            showVolume ? "border-blue-400 bg-blue-400" : "border-slate-600",
          )} />
          Volume
        </button>

        <span className="mx-1 h-3 w-px bg-white/[0.08]" />

        <a
          href={tvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-blue-400"
        >
          <ExternalLink className="h-3 w-3" strokeWidth={2} /> TradingView
        </a>

        <button
          onClick={onToggleMax}
          title={maximized ? "Minimize" : "Maximize"}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-white/[0.04] hover:text-slate-300"
        >
          {maximized
            ? <Minimize2 className="h-3.5 w-3.5" strokeWidth={2} />
            : <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
          }
        </button>
      </div>
    </div>
  );
}

// ── OHLC info strip ────────────────────────────────────────────────────────────
function OHLCRow({ d }: { d: OHLCDisplay }) {
  return (
    <div className="flex items-center gap-3 px-0.5 text-[11px]">
      <span className="text-slate-600">O <span className="font-mono text-slate-400">{fmt(d.o)}</span></span>
      <span className="text-slate-600">H <span className="font-mono text-emerald-400">{fmt(d.h)}</span></span>
      <span className="text-slate-600">L <span className="font-mono text-rose-400">{fmt(d.l)}</span></span>
      <span className="text-slate-600">C <span className={cn("font-mono", d.c >= d.o ? "text-emerald-400" : "text-rose-400")}>{fmt(d.c)}</span></span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props { ticker: string; exchange: "NSE" | "BSE" }

export function StockPriceChart({ ticker, exchange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const maxRef        = useRef<HTMLDivElement>(null);

  const [period,     setPeriod]  = useState<Period>("1y");
  const [chartType,  setType]    = useState<ChartType>("line");
  const [showVolume, setVolume]  = useState(false);
  const [bars,       setBars]    = useState<PriceBar[]>([]);
  const [loading,    setLoading] = useState(false);
  const [error,      setError]   = useState(false);
  const [crosshair,  setCross]   = useState<OHLCDisplay | null>(null);
  const [maximized,  setMax]     = useState(false);
  const [mounted,    setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close maximized on Escape
  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMax(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized]);

  const lastBar: OHLCDisplay | null = bars.length
    ? { o: bars.at(-1)!.open, h: bars.at(-1)!.high, l: bars.at(-1)!.low, c: bars.at(-1)!.close }
    : null;
  const display = crosshair ?? lastBar;
  const tvUrl   = `https://www.tradingview.com/symbols/${exchange}-${ticker}/`;

  // Fetch OHLCV
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(false); setBars([]);
    fetch(`/api/price-history/${ticker}?period=${period}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        Array.isArray(json) ? setBars(json) : setError(true);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ticker, period]);

  // Inline chart
  useEffect(() => {
    if (loading || bars.length === 0 || maximized) return;
    const el = containerRef.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    mountChart(el, bars, chartType, showVolume, 260, (d) => setCross(d)).then((fn) => {
      if (cancelled) { fn(); return; }
      cleanup = fn;
    });
    return () => { cancelled = true; cleanup?.(); };
  }, [loading, bars, chartType, showVolume, maximized]);

  // Maximized chart
  useEffect(() => {
    if (!maximized || loading || bars.length === 0) return;
    const el = maxRef.current;
    if (!el) return;
    const h = Math.max(window.innerHeight - 180, 400);
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    mountChart(el, bars, chartType, showVolume, h, (d) => setCross(d)).then((fn) => {
      if (cancelled) { fn(); return; }
      cleanup = fn;
    });
    return () => { cancelled = true; cleanup?.(); };
  }, [maximized, loading, bars, chartType, showVolume]);

  const sharedControls = (
    <Controls
      period={period} setPeriod={setPeriod}
      chartType={chartType} setType={setType}
      showVolume={showVolume} setVolume={setVolume}
      tvUrl={tvUrl} maximized={maximized} onToggleMax={() => setMax((m) => !m)}
    />
  );

  return (
    <>
      {/* ── Inline chart ── */}
      <div>
        <div className="mb-2">{sharedControls}</div>
        {display && !loading && <div className="mb-1.5"><OHLCRow d={display} /></div>}

        {loading ? (
          <div className="flex h-[260px] items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
          </div>
        ) : error ? (
          <div className="flex h-[260px] items-center justify-center rounded-xl border border-white/[0.05] bg-slate-900/40">
            <p className="text-xs text-slate-600">Price history unavailable</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={cn("w-full overflow-hidden rounded-xl border border-white/[0.05]", maximized && "invisible")}
          />
        )}
      </div>

      {/* ── Maximized modal (portal) ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {maximized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] flex flex-col bg-slate-950/98 backdrop-blur-md"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-200">{ticker}</span>
                  <span className="text-xs text-slate-600">{exchange}</span>
                  {display && <OHLCRow d={display} />}
                </div>
                <button
                  onClick={() => setMax(false)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {/* Controls */}
              <div className="border-b border-white/[0.06] px-5 py-2">
                {sharedControls}
              </div>

              {/* Chart */}
              <div className="flex-1 p-4">
                <div
                  ref={maxRef}
                  className="w-full overflow-hidden rounded-xl border border-white/[0.05]"
                />
              </div>

              <p className="pb-3 text-center text-[10px] text-slate-700">
                Press <kbd className="rounded border border-white/10 px-1 py-0.5 font-mono text-[9px]">Esc</kbd> to close
              </p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
