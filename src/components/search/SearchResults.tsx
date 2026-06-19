"use client";

import { motion } from "framer-motion";
import type { SymbolEntry } from "@/lib/search/fuse";
import { cn } from "@/lib/utils";

interface Props {
  results:      SymbolEntry[];
  focusedIndex: number;
  onSelect:     (entry: SymbolEntry) => void;
  onHover:      (index: number) => void;
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

export function SearchResults({ results, focusedIndex, onSelect, onHover }: Props) {
  if (results.length === 0) return null;

  return (
    <motion.ul
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      role="listbox"
      className="absolute left-0 top-full z-[200] mt-2 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
    >
      {results.map((entry, i) => {
        const sectorClass = SECTOR_COLORS[entry.sector] ?? "text-slate-400 bg-slate-500/10";
        return (
          <li
            key={entry.ticker}
            role="option"
            aria-selected={i === focusedIndex}
            onMouseEnter={() => onHover(i)}
            onMouseDown={() => onSelect(entry)}
            className={cn(
              "flex cursor-pointer items-center justify-between px-4 py-3 transition-colors duration-100",
              i === focusedIndex ? "bg-blue-500/10" : "hover:bg-white/[0.03]",
              i > 0 && "border-t border-white/[0.05]",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-[10px] font-bold text-blue-400 tracking-wide">
                {entry.ticker.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-200">{entry.name}</p>
                <p className="font-mono-num text-xs text-slate-500">{entry.ticker} · {entry.exchange}</p>
              </div>
            </div>
            <span className={cn("ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", sectorClass)}>
              {entry.sector}
            </span>
          </li>
        );
      })}
    </motion.ul>
  );
}
