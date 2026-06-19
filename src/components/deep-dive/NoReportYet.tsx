import Link from "next/link";
import { FileSearch, ArrowLeft } from "lucide-react";

interface Props {
  ticker:      string;
  companyName: string;
}

const SEED_LINKS = [
  { ticker: "RELIANCE", name: "Reliance Industries", label: "Energy · Retail · Telecom" },
  { ticker: "INFY",     name: "Infosys",             label: "IT Services" },
  { ticker: "HDFCBANK", name: "HDFC Bank",           label: "Private Banking" },
];

export function NoReportYet({ ticker, companyName }: Props) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-900/60">
        <FileSearch className="h-7 w-7 text-slate-500" strokeWidth={1.5} />
      </div>

      <h2 className="mb-1 text-xl font-bold text-slate-100">{companyName}</h2>
      <p className="mb-6 font-mono-num text-sm text-slate-500">{ticker} · NSE</p>

      <div className="mb-8 rounded-xl border border-dashed border-white/[0.08] bg-slate-900/40 p-6 text-left">
        <p className="mb-1.5 text-sm font-semibold text-slate-300">Report not generated yet</p>
        <p className="text-sm leading-relaxed text-slate-500">
          Live data fetching and AI-generated analysis arrives in Stage 1.
          Deep dives are currently available for{" "}
          <span className="font-medium text-slate-300">RELIANCE, INFY, and HDFCBANK</span>{" "}
          as hand-crafted seed examples.
        </p>
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
        Try a sample deep dive
      </p>
      <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SEED_LINKS.map((s) => (
          <Link
            key={s.ticker}
            href={`/stock/${s.ticker}`}
            className="flex flex-col rounded-xl border border-white/[0.06] bg-slate-900/60 p-3.5 text-left transition-all duration-200 hover:border-blue-500/25 hover:bg-slate-900 cursor-pointer"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/12 text-[10px] font-bold text-blue-400">
              {s.ticker.slice(0, 2)}
            </div>
            <p className="text-xs font-semibold text-slate-200">{s.name}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to search
      </Link>
    </div>
  );
}
