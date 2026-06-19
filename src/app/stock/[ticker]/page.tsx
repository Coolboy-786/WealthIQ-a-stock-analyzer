import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NavBar } from "@/components/nav/NavBar";
import { SearchBar } from "@/components/search/SearchBar";
import { DeepDiveSkeleton } from "@/components/deep-dive/DeepDiveSkeleton";
import { ReportLoader } from "./ReportLoader";
import Link from "next/link";
import symbols from "@/data/symbols.json";

interface Props {
  params: Promise<{ ticker: string }>;
}

type SymbolEntry = { ticker: string; name: string; sector: string; industry: string; exchange: string };

function getSymbol(ticker: string): SymbolEntry | undefined {
  return (symbols as SymbolEntry[]).find((s) => s.ticker === ticker.toUpperCase());
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

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar />

      {/* ── Subheader — renders instantly ──────────────────────────────────── */}
      <div className="relative z-[150] border-b border-white/[0.04] bg-slate-950/60 px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Home
          </Link>
          <svg className="h-3 w-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-mono-num text-xs font-medium text-slate-400">{upperTicker}</span>
          <span className="text-xs text-slate-600">{sym.name !== upperTicker ? `· ${sym.name}` : ""}</span>
          <div className="ml-auto max-w-xs flex-1">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ── Content — skeleton shows instantly, report streams in ──────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<DeepDiveSkeleton />}>
          <ReportLoader ticker={upperTicker} companyName={sym.name} />
        </Suspense>
      </div>

      <footer className="mt-8 border-t border-white/[0.04] px-4 py-5 text-center text-xs text-slate-600">
        WealthIQ is educational only — not investment advice. Verify all figures independently.
      </footer>
    </div>
  );
}
