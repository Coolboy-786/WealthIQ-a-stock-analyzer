"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchSymbols, type SymbolEntry } from "@/lib/search/fuse";
import { SearchResults } from "./SearchResults";

export function SearchBar() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SymbolEntry[]>([]);
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);
  const router                = useRouter();

  useEffect(() => {
    const hits = searchSymbols(query);
    setResults(hits);
    setOpen(hits.length > 0);
    setFocused(0);
  }, [query]);

  const navigate = useCallback((entry: SymbolEntry) => {
    setQuery("");
    setOpen(false);
    router.push(`/stock/${entry.ticker}`);
  }, [router]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); if (results[focused]) navigate(results[focused]); }
    if (e.key === "Escape")    { setOpen(false); inputRef.current?.blur(); }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-slate-900/80 px-4 py-3.5 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-200 focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/20 focus-within:shadow-blue-500/10">
        <Search className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search NSE/BSE stocks — name or ticker…"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search stocks"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="cursor-pointer rounded-md p-0.5 text-slate-500 transition-colors hover:text-slate-300"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {open && (
        <SearchResults
          results={results}
          focusedIndex={focused}
          onSelect={navigate}
          onHover={setFocused}
        />
      )}
    </div>
  );
}
