import Fuse from "fuse.js";
import symbols  from "@/data/symbols.json";
import mfRaw    from "@/data/mf-schemes.json";

export interface SymbolEntry {
  ticker:   string;
  name:     string;
  exchange: string;
  sector:   string;
  industry: string;
  type:     "stock" | "etf" | "invit" | "reit";
}

export interface MFEntry {
  schemeCode: number;
  name:       string;
  fundHouse:  string;
  category:   string;
  isEtf?:     true;
  type:       "mutualfund";
}

export type SearchEntry = SymbolEntry | MFEntry;

const stockList = (symbols as Omit<SymbolEntry, "type">[]).map((s) => ({
  ...s,
  type: ((s as SymbolEntry).type ?? "stock") as SymbolEntry["type"],
}));

const mfList: MFEntry[] = (mfRaw as Omit<MFEntry, "type">[]).map((m) => ({
  ...m,
  type: "mutualfund",
}));

const stockFuse = new Fuse<SymbolEntry>(stockList, {
  keys:               [{ name: "ticker", weight: 2 }, { name: "name", weight: 1 }],
  threshold:          0.35,
  includeScore:       true,
  minMatchCharLength: 1,
});

const mfFuse = new Fuse<MFEntry>(mfList, {
  keys:               [
    { name: "name",      weight: 3 },
    { name: "fundHouse", weight: 1 },
    { name: "category",  weight: 0.5 },
  ],
  threshold:          0.35,
  includeScore:       true,
  minMatchCharLength: 2,
});

export function searchSymbols(query: string, limit = 6): SymbolEntry[] {
  if (!query.trim()) return [];
  return stockFuse.search(query, { limit }).map((r) => r.item);
}

export function searchFunds(query: string, limit = 5): MFEntry[] {
  if (!query.trim()) return [];
  return mfFuse.search(query, { limit }).map((r) => r.item);
}

export function searchAll(query: string): { stocks: SymbolEntry[]; funds: MFEntry[] } {
  if (!query.trim()) return { stocks: [], funds: [] };
  return {
    stocks: searchSymbols(query, 6),
    funds:  searchFunds(query, 5),
  };
}
