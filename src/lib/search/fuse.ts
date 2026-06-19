import Fuse from "fuse.js";
import symbols from "@/data/symbols.json";

export interface SymbolEntry {
  ticker:   string;
  name:     string;
  exchange: string;
  sector:   string;
  industry: string;
}

const fuse = new Fuse<SymbolEntry>(symbols as SymbolEntry[], {
  keys:              [{ name: "ticker", weight: 2 }, { name: "name", weight: 1 }],
  threshold:         0.35,
  includeScore:      true,
  minMatchCharLength: 1,
});

export function searchSymbols(query: string, limit = 8): SymbolEntry[] {
  if (!query.trim()) return [];
  return fuse.search(query, { limit }).map((r) => r.item);
}
