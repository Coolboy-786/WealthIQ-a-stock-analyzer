import type { TheViewTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { CheckCircle2, AlertTriangle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const CONFIDENCE_DOT: Record<string, string> = {
  High:   "bg-emerald-400",
  Medium: "bg-amber-400",
  Low:    "bg-red-400",
};

export function TheViewTab({ data }: { data: TheViewTab }) {
  return (
    <div className="space-y-6">
      {/* Quality + Confidence */}
      <div className="flex flex-wrap items-center gap-5">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Overall Quality
          </p>
          <VerdictBadge verdict={data.overallQuality} size="lg" showDot />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Data Confidence
          </p>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
            <span className={cn("h-2 w-2 rounded-full", CONFIDENCE_DOT[data.dataConfidence] ?? "bg-slate-500")} />
            <span className="text-sm font-semibold text-slate-300">{data.dataConfidence}</span>
          </div>
        </div>
      </div>

      {/* Strengths + Watch points */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Strengths</p>
          </div>
          <ul className="space-y-2.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-snug text-slate-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Watch Points</p>
          </div>
          <ul className="space-y-2.5">
            {data.watchPoints.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-snug text-slate-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* One thing to track */}
      {data.oneThingToTrack && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">One Thing to Track</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">{data.oneThingToTrack}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Disclaimer</p>
        <p className="text-xs leading-relaxed text-slate-600">{data.disclaimer}</p>
      </div>
    </div>
  );
}
