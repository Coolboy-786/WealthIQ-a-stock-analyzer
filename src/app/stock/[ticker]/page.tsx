import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import type { DeepDiveReport } from "@/types/report";
import { DeepDive } from "@/components/deep-dive/DeepDive";
import { NoReportYet } from "@/components/deep-dive/NoReportYet";
import { NavBar } from "@/components/nav/NavBar";
import { SearchBar } from "@/components/search/SearchBar";
import Link from "next/link";
import symbols from "@/data/symbols.json";

interface Props {
  params: Promise<{ ticker: string }>;
}

type SymbolEntry = { ticker: string; name: string; sector: string; industry: string; exchange: string };

function loadSeedReport(ticker: string): DeepDiveReport | null {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "seed", `${ticker}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as DeepDiveReport;
  } catch {
    return null;
  }
}

function getSymbol(ticker: string): SymbolEntry | undefined {
  return (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
}

async function fetchLiveReport(ticker: string): Promise<DeepDiveReport | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/report/${ticker}`, {
      cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
      next:  process.env.NODE_ENV === "development" ? undefined : { revalidate: 60 * 60 * 4 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<DeepDiveReport>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const sym = getSymbol(ticker);
  if (!sym) return { title: "Stock Not Found — WealthIQ" };
  return {
    title: `${sym.name} (${sym.ticker}) Deep Dive — WealthIQ`,
    description: `Fundamentals deep dive for ${sym.name}: valuation, growth, health, returns, ownership. No tips. No targets.`,
  };
}

export default async function StockPage({ params }: Props) {
  const { ticker }  = await params;
  const upperTicker = ticker.toUpperCase();
  const sym         = getSymbol(upperTicker);

  if (!sym) notFound();

  // Try live data first; fall back to seed JSON
  const liveReport = await fetchLiveReport(upperTicker);
  const report = liveReport ?? loadSeedReport(upperTicker);

  const isLive = liveReport !== null;

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar />

      {/* ── Subheader ────────────────────────────────────────────────────────── */}
      <div className="relative z-[150] border-b border-white/[0.04] bg-slate-950/60 px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Home</Link>
          <svg className="h-3 w-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-mono-num text-xs font-medium text-slate-400">{upperTicker}</span>
          {isLive && (
            <span className="ml-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Live data
            </span>
          )}
          <div className="ml-auto max-w-xs flex-1">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {report ? (
          <DeepDive report={report} />
        ) : (
          <NoReportYet ticker={upperTicker} companyName={sym.name} />
        )}
      </div>

      <footer className="mt-8 border-t border-white/[0.04] px-4 py-5 text-center text-xs text-slate-600">
        WealthIQ is educational only — not investment advice. Verify all figures independently.
      </footer>
    </div>
  );
}
