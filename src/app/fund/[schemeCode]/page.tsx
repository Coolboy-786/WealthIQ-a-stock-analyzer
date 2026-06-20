import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/nav/NavBar";
import { SearchBar } from "@/components/search/SearchBar";
import { DeepDiveSkeleton } from "@/components/deep-dive/DeepDiveSkeleton";
import { FundLoader } from "./FundLoader";
import mfSchemes from "@/data/mf-schemes.json";

interface Props {
  params: Promise<{ schemeCode: string }>;
}

type MFScheme = { schemeCode: number; name: string; fundHouse: string; category: string; isEtf?: true };

function getScheme(code: string): MFScheme | undefined {
  const n = Number(code);
  return (mfSchemes as MFScheme[]).find((s) => s.schemeCode === n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { schemeCode } = await params;
  const scheme = getScheme(schemeCode);
  if (!scheme) return { title: "Fund Not Found — WealthIQ" };
  return {
    title: `${scheme.name} — WealthIQ`,
    description: `${scheme.isEtf ? "ETF" : "Mutual fund"} deep dive for ${scheme.name} by ${scheme.fundHouse}. Educational analysis only — no advice.`,
  };
}

export default async function FundPage({ params }: Props) {
  const { schemeCode } = await params;
  const scheme = getScheme(schemeCode);

  if (!scheme) notFound();

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar />

      {/* ── Subheader ─────────────────────────────────────────────────────── */}
      <div className="relative z-[150] border-b border-white/[0.04] bg-slate-950/60 px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Home
          </Link>
          <svg className="h-3 w-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-medium text-slate-400 truncate max-w-xs">{scheme.name}</span>
          <div className="ml-auto max-w-xs flex-1">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ── Content — skeleton shows instantly, report streams in ─────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<DeepDiveSkeleton />}>
          <FundLoader schemeCode={Number(schemeCode)} />
        </Suspense>
      </div>

      <footer className="mt-8 border-t border-white/[0.04] px-4 py-5 text-center text-xs text-slate-600">
        WealthIQ is educational only — not investment advice. Verify all figures independently.
      </footer>
    </div>
  );
}
