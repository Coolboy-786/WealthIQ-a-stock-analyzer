"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

function useAnimatedCount(target: number, duration = 900) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const start = prev.current;
    const diff  = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * ease));
      if (t < 1) requestAnimationFrame(tick);
      else { setDisplay(target); prev.current = target; }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
}

export function LocCounter() {
  const [loc,      setLoc]      = useState(0);
  const [files,    setFiles]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(true);
  const animated = useAnimatedCount(loc);

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch("/api/dev/loc", { cache: "no-store" });
      const d = await r.json();
      setLoc(d.loc);
      setFiles(d.files);
    } finally {
      setLoading(false);
    }
  }

  // Fetch on mount, then every 30s
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="fixed bottom-4 right-4 z-50 select-none"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/90 shadow-2xl shadow-black/60 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors"
        >
          <Code2 className="h-3.5 w-3.5 text-blue-400 shrink-0" strokeWidth={2} />
          <span className="font-mono text-[11px] font-semibold text-blue-400 tabular-nums">
            {animated.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-600">LOC</span>
          <span className="ml-auto text-slate-700">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </span>
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/[0.05] px-3 py-2 space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">Files</span>
                  <span className="font-mono tabular-nums text-slate-400">{files}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">Avg/file</span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {files ? Math.round(loc / files) : 0}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">Target</span>
                  <span className="font-mono tabular-nums text-slate-500">200,000</span>
                </div>

                {/* Progress bar toward 200k */}
                <div className="mt-1">
                  <div className="mb-0.5 flex justify-between text-[9px] text-slate-700">
                    <span>to goal</span>
                    <span>{((loc / 200_000) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((loc / 200_000) * 100, 100)}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Refresh */}
                <button
                  onClick={(e) => { e.stopPropagation(); refresh(); }}
                  disabled={loading}
                  className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-700 hover:text-slate-500 transition-colors"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
                  {loading ? "counting…" : "refresh"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
