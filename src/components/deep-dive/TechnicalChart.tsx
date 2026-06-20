"use client";

import { useEffect, useRef, useState } from "react";
import type { TechBar } from "@/app/api/technical/[ticker]/route";
import { sma, ema, rsi, macd, bollingerBands } from "@/lib/technical/indicators";
import { cn } from "@/lib/utils";

type ViewPeriod  = "1m" | "3m" | "6m" | "1y" | "all";
type Overlay     = "ma20" | "ma50" | "ma200" | "ema20" | "bb";
type ChartMode   = "line" | "candle";

const VIEWS: { key: ViewPeriod; label: string }[] = [
  { key: "1m", label: "1M" }, { key: "3m", label: "3M" }, { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" }, { key: "all", label: "All" },
];

const OVERLAYS: { key: Overlay; label: string; color: string }[] = [
  { key: "ma20",  label: "MA 20",  color: "text-blue-400"   },
  { key: "ma50",  label: "MA 50",  color: "text-orange-400" },
  { key: "ma200", label: "MA 200", color: "text-purple-400" },
  { key: "ema20", label: "EMA 20", color: "text-cyan-400"   },
  { key: "bb",    label: "BB",     color: "text-slate-400"  },
];

function offsetDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toViewFrom(view: ViewPeriod): string | null {
  if (view === "all") return null;
  const m = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 }[view];
  return offsetDate(m);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterNulls<T extends { time: never; value: number | null }>(arr: T[]): any[] {
  return arr.filter((d) => d.value !== null);
}

interface Props {
  bars:           TechBar[];
  ticker:         string;
  exchange:       string;
  focusIndicator?: "rsi" | "macd" | "ma" | "bb";
}

const FOCUS_OVERLAYS: Record<string, Set<Overlay>> = {
  rsi:  new Set([]),
  macd: new Set([]),
  ma:   new Set(["ma20", "ma50", "ma200"]),
  bb:   new Set(["bb"]),
};

export function TechnicalChart({ bars, ticker, exchange, focusIndicator }: Props) {
  const priceRef = useRef<HTMLDivElement>(null);
  const rsiRef   = useRef<HTMLDivElement>(null);
  const macdRef  = useRef<HTMLDivElement>(null);

  const [view,      setView]     = useState<ViewPeriod>("1y");
  const [mode,      setMode]     = useState<ChartMode>("candle");
  const [overlays,  setOverlays] = useState<Set<Overlay>>(
    focusIndicator ? FOCUS_OVERLAYS[focusIndicator] : new Set(["ma20", "ma50"]),
  );

  // Store chart refs for view updates without rebuild
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartsRef = useRef<{ price: any; rsi: any; macd: any } | null>(null);

  function toggleOverlay(key: Overlay) {
    setOverlays((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Build charts
  useEffect(() => {
    if (bars.length === 0) return;
    const pEl = priceRef.current;
    const rEl = rsiRef.current;
    const mEl = macdRef.current;
    if (!pEl || !rEl || !mEl) return;

    let cancelled = false;

    (async () => {
      const {
        createChart, CandlestickSeries, LineSeries, HistogramSeries, ColorType, LineStyle,
      } = await import("lightweight-charts");

      if (cancelled) return;

      const closes  = bars.map((b) => b.close);
      const sma20v  = sma(closes, 20);
      const sma50v  = sma(closes, 50);
      const sma200v = sma(closes, 200);
      const ema20v  = ema(closes, 20);
      const bb      = bollingerBands(closes, 20, 2);
      const rsiV    = rsi(closes, 14);
      const macdV   = macd(closes);

      const baseOpts = (bg = "#0F172A") => ({
        layout: { background: { type: ColorType.Solid, color: bg }, textColor: "#64748B", fontSize: 10 },
        grid:   { vertLines: { visible: false }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderVisible: false },
        leftPriceScale:  { visible: false },
        timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      });

      // ── Price chart ──
      const priceChart = createChart(pEl, { ...baseOpts(), width: pEl.clientWidth, height: 300,
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.05 } },
      });

      if (mode === "candle") {
        const cs = priceChart.addSeries(CandlestickSeries, {
          upColor: "#10B981", downColor: "#EF4444",
          borderUpColor: "#10B981", borderDownColor: "#EF4444",
          wickUpColor:   "#10B981", wickDownColor:   "#EF4444",
        });
        cs.setData(bars.map((d) => ({ time: d.time as never, open: d.open, high: d.high, low: d.low, close: d.close })));
      } else {
        const ls = priceChart.addSeries(LineSeries, { color: "#3B82F6", lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
        ls.setData(bars.map((d) => ({ time: d.time as never, value: d.close })));
      }

      if (overlays.has("ma20")) {
        const s = priceChart.addSeries(LineSeries, { color: "#3B82F6", lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(filterNulls(sma20v.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      }
      if (overlays.has("ma50")) {
        const s = priceChart.addSeries(LineSeries, { color: "#F97316", lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(filterNulls(sma50v.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      }
      if (overlays.has("ma200")) {
        const s = priceChart.addSeries(LineSeries, { color: "#A855F7", lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
        s.setData(filterNulls(sma200v.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      }
      if (overlays.has("ema20")) {
        const s = priceChart.addSeries(LineSeries, { color: "#22D3EE", lineWidth: 1, lastValueVisible: false, priceLineVisible: false, lineStyle: LineStyle.Dashed });
        s.setData(filterNulls(ema20v.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      }
      if (overlays.has("bb")) {
        const opts = { lineWidth: 1 as const, lastValueVisible: false, priceLineVisible: false, lineStyle: LineStyle.Dotted, color: "rgba(148,163,184,0.5)" };
        const u = priceChart.addSeries(LineSeries, opts);
        const m = priceChart.addSeries(LineSeries, { ...opts, color: "rgba(148,163,184,0.3)", lineStyle: LineStyle.Dashed });
        const l = priceChart.addSeries(LineSeries, opts);
        u.setData(filterNulls(bb.upper.map((v, i) => ({ time: bars[i].time as never, value: v }))));
        m.setData(filterNulls(bb.mid.map((v, i)   => ({ time: bars[i].time as never, value: v }))));
        l.setData(filterNulls(bb.lower.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      }

      // ── RSI chart ──
      const rsiChart = createChart(rEl, { ...baseOpts(), width: rEl.clientWidth, height: 120,
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderVisible: false, visible: false },
      });
      const rsiLine = rsiChart.addSeries(LineSeries, { color: "#8B5CF6", lineWidth: 2, lastValueVisible: true, priceLineVisible: false });
      rsiLine.setData(filterNulls(rsiV.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      rsiLine.createPriceLine({ price: 70, color: "rgba(239,68,68,0.4)", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "70" });
      rsiLine.createPriceLine({ price: 30, color: "rgba(16,185,129,0.4)", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "30" });

      // ── MACD chart ──
      const macdChart = createChart(mEl, { ...baseOpts(), width: mEl.clientWidth, height: 120,
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      });
      const macdLine = macdChart.addSeries(LineSeries, { color: "#3B82F6", lineWidth: 2, lastValueVisible: true, priceLineVisible: false });
      macdLine.setData(filterNulls(macdV.line.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      const sigLine = macdChart.addSeries(LineSeries, { color: "#F59E0B", lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
      sigLine.setData(filterNulls(macdV.signal.map((v, i) => ({ time: bars[i].time as never, value: v }))));
      const histSeries = macdChart.addSeries(HistogramSeries, { lastValueVisible: false, priceLineVisible: false });
      histSeries.setData(macdV.hist.filter((v) => v !== null).map((v, _i, _arr) => {
        const realIdx = macdV.hist.indexOf(v);
        return { time: bars[realIdx]?.time as never ?? bars[0].time as never, value: v as number, color: (v as number) >= 0 ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)" };
      }));

      // ── Sync time scales ──
      priceChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range) return;
        rsiChart.timeScale().setVisibleLogicalRange(range);
        macdChart.timeScale().setVisibleLogicalRange(range);
      });
      macdChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range) return;
        priceChart.timeScale().setVisibleLogicalRange(range);
        rsiChart.timeScale().setVisibleLogicalRange(range);
      });

      // ── Set initial view ──
      function applyView(v: ViewPeriod) {
        const from = toViewFrom(v);
        if (!from) {
          priceChart.timeScale().fitContent();
          rsiChart.timeScale().fitContent();
          macdChart.timeScale().fitContent();
        } else {
          const range = {
            from: from as never,
            to:   bars[bars.length - 1].time as never,
          };
          priceChart.timeScale().setVisibleRange(range);
        }
      }
      applyView(view);
      chartsRef.current = { price: priceChart, rsi: rsiChart, macd: macdChart };
      (chartsRef.current as unknown as { applyView: (v: ViewPeriod) => void }).applyView = applyView;

      // Resize
      const ro = new ResizeObserver(() => {
        priceChart.applyOptions({ width: pEl.clientWidth });
        rsiChart.applyOptions({ width: rEl.clientWidth });
        macdChart.applyOptions({ width: mEl.clientWidth });
      });
      ro.observe(pEl);
    })();

    return () => {
      cancelled = true;
      if (chartsRef.current) {
        chartsRef.current.price.remove();
        chartsRef.current.rsi.remove();
        chartsRef.current.macd.remove();
        chartsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, mode, overlays]);

  // Apply view without rebuilding charts
  useEffect(() => {
    const c = chartsRef.current;
    if (!c) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyView = (c as any).applyView as ((v: ViewPeriod) => void) | undefined;
    applyView?.(view);
  }, [view]);

  const tvUrl = `https://www.tradingview.com/symbols/${exchange}-${ticker}/`;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* View period */}
        <div className="flex items-center gap-0.5">
          {VIEWS.map(({ key, label }) => (
            <button key={key} onClick={() => setView(key)}
              className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors",
                view === key ? "bg-blue-500/20 text-blue-400" : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400"
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Mode + overlays */}
        <div className="flex flex-wrap items-center gap-1">
          <button onClick={() => setMode("line")}
            className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors",
              mode === "line" ? "bg-blue-500/20 text-blue-400" : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400")}>
            Line
          </button>
          <button onClick={() => setMode("candle")}
            className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors",
              mode === "candle" ? "bg-blue-500/20 text-blue-400" : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-400")}>
            Candle
          </button>
          <span className="mx-1 h-3 w-px bg-white/[0.08]" />
          {OVERLAYS.map(({ key, label, color }) => (
            <button key={key} onClick={() => toggleOverlay(key)}
              className={cn("rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                overlays.has(key)
                  ? `border-white/[0.10] bg-white/[0.04] ${color}`
                  : "border-transparent text-slate-700 hover:text-slate-500")}>
              {label}
            </button>
          ))}
          <span className="mx-1 h-3 w-px bg-white/[0.08]" />
          <a href={tvUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 hover:text-blue-400 transition-colors">
            ↗ TradingView
          </a>
        </div>
      </div>

      {/* Charts stacked */}
      <div className="overflow-hidden rounded-xl border border-white/[0.05]">
        <div ref={priceRef} className="w-full" />
        {/* RSI label */}
        <div className="flex items-center gap-2 border-t border-white/[0.05] bg-slate-950/60 px-3 py-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-purple-400">RSI 14</span>
          <span className="h-px flex-1 bg-white/[0.04]" />
        </div>
        <div ref={rsiRef} className="w-full" />
        {/* MACD label */}
        <div className="flex items-center gap-2 border-t border-white/[0.05] bg-slate-950/60 px-3 py-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-blue-400">MACD 12/26/9</span>
          <span className="text-[9px] text-slate-700 ml-2">Line</span>
          <span className="h-2 w-3 rounded-sm bg-blue-400/60 inline-block" />
          <span className="text-[9px] text-slate-700">Signal</span>
          <span className="h-2 w-3 rounded-sm bg-amber-400/60 inline-block" />
          <span className="h-px flex-1 bg-white/[0.04]" />
        </div>
        <div ref={macdRef} className="w-full" />
      </div>
    </div>
  );
}
