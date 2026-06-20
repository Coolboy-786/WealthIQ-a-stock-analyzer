"use client";

import { motion } from "framer-motion";
import type { SymbolEntry, MFEntry } from "@/lib/search/fuse";
import { cn } from "@/lib/utils";

interface Props {
  stocks:       SymbolEntry[];
  funds:        MFEntry[];
  focusedIndex: number;
  onSelect:     (entry: SymbolEntry | MFEntry, flatIndex: number) => void;
  onHover:      (flatIndex: number) => void;
}

const SECTOR_COLORS: Record<string, string> = {
  Technology:           "text-blue-400    bg-blue-500/10",
  "Financial Services": "text-violet-400  bg-violet-500/10",
  Energy:               "text-orange-400  bg-orange-500/10",
  FMCG:                 "text-emerald-400 bg-emerald-500/10",
  Healthcare:           "text-rose-400    bg-rose-500/10",
  Industrials:          "text-slate-400   bg-slate-500/10",
  Materials:            "text-amber-400   bg-amber-500/10",
  Utilities:            "text-teal-400    bg-teal-500/10",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Large Cap":        "text-blue-400    bg-blue-500/10",
  "Mid Cap":          "text-violet-400  bg-violet-500/10",
  "Small Cap":        "text-rose-400    bg-rose-500/10",
  "Flexi Cap":        "text-indigo-400  bg-indigo-500/10",
  "Multi Cap":        "text-indigo-400  bg-indigo-500/10",
  "ELSS":             "text-emerald-400 bg-emerald-500/10",
  "Index":            "text-sky-400     bg-sky-500/10",
  "Liquid":           "text-slate-400   bg-slate-500/10",
  "Debt":             "text-amber-400   bg-amber-500/10",
  "Hybrid":           "text-teal-400    bg-teal-500/10",
  "Balanced Advantage":"text-teal-400   bg-teal-500/10",
  "International":    "text-orange-400  bg-orange-500/10",
  "Gold":             "text-yellow-400  bg-yellow-500/10",
};

const TYPE_BADGE: Record<string, string> = {
  etf:   "text-amber-400  bg-amber-500/10",
  invit: "text-teal-400   bg-teal-500/10",
  reit:  "text-violet-400 bg-violet-500/10",
};

function SectionLabel({ label }: { label: string }) {
  return (
    <li className="px-4 pb-1 pt-2.5">
      <span className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
        {label}
      </span>
    </li>
  );
}

export function SearchResults({ stocks, funds, focusedIndex, onSelect, onHover }: Props) {
  if (stocks.length === 0 && funds.length === 0) return null;

  const rows: { el: React.ReactNode; flatIdx: number }[] = [];

  // ── STOCKS / ETFs / InvITs section ──────────────────────────────────────
  if (stocks.length > 0) {
    rows.push({ el: <SectionLabel label="Stocks · ETFs · InvITs" />, flatIdx: -1 });
    stocks.forEach((entry, i) => {
      const flatIdx = i;
      const isEtfLike = entry.type !== "stock";
      const badgeClass = isEtfLike
        ? (TYPE_BADGE[entry.type] ?? "text-slate-400 bg-slate-500/10")
        : (SECTOR_COLORS[entry.sector] ?? "text-slate-400 bg-slate-500/10");
      const badgeLabel = isEtfLike
        ? entry.type.toUpperCase()
        : entry.sector;

      rows.push({
        flatIdx,
        el: (
          <li
            key={entry.ticker}
            role="option"
            aria-selected={flatIdx === focusedIndex}
            onMouseEnter={() => onHover(flatIdx)}
            onMouseDown={() => onSelect(entry, flatIdx)}
            className={cn(
              "flex cursor-pointer items-center justify-between px-4 py-3 transition-colors duration-100",
              flatIdx === focusedIndex ? "bg-blue-500/10" : "hover:bg-white/[0.03]",
              "border-t border-white/[0.05]",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-[10px] font-bold text-blue-400 tracking-wide">
                {entry.ticker.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">{entry.name}</p>
                <p className="font-mono text-xs text-slate-500">{entry.ticker} · {entry.exchange}</p>
              </div>
            </div>
            <span className={cn("ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", badgeClass)}>
              {badgeLabel}
            </span>
          </li>
        ),
      });
    });
  }

  // ── MUTUAL FUNDS section ─────────────────────────────────────────────────
  if (funds.length > 0) {
    rows.push({ el: <SectionLabel label="Mutual Funds · ETFs" />, flatIdx: -1 });
    funds.forEach((entry, i) => {
      const flatIdx = stocks.length + i;
      const isEtf   = !!entry.isEtf;
      const iconBg  = isEtf ? "bg-amber-500/15" : "bg-emerald-500/15";
      const iconTxt = isEtf ? "text-amber-400"  : "text-emerald-400";
      const iconLbl = isEtf ? "ETF"              : "MF";
      const catClass = isEtf
        ? "text-amber-400 bg-amber-500/10"
        : (CATEGORY_COLORS[entry.category] ?? "text-slate-400 bg-slate-500/10");

      rows.push({
        flatIdx,
        el: (
          <li
            key={entry.schemeCode}
            role="option"
            aria-selected={flatIdx === focusedIndex}
            onMouseEnter={() => onHover(flatIdx)}
            onMouseDown={() => onSelect(entry, flatIdx)}
            className={cn(
              "flex cursor-pointer items-center justify-between px-4 py-3 transition-colors duration-100",
              flatIdx === focusedIndex ? "bg-blue-500/10" : "hover:bg-white/[0.03]",
              "border-t border-white/[0.05]",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide", iconBg, iconTxt)}>
                {iconLbl}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">{entry.name}</p>
                <p className="truncate text-xs text-slate-500">{entry.fundHouse}</p>
              </div>
            </div>
            <span className={cn("ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", catClass)}>
              {isEtf ? "ETF" : entry.category}
            </span>
          </li>
        ),
      });
    });
  }

  return (
    <motion.ul
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      role="listbox"
      className="absolute left-0 top-full z-[200] mt-2 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
    >
      {rows.map(({ el }, idx) => (
        <span key={idx}>{el}</span>
      ))}
    </motion.ul>
  );
}
