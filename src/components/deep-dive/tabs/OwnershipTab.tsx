import type { OwnershipTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { StatCard } from "@/components/ui/stat-card";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import { formatPercent, formatNumber } from "@/lib/utils";

export function OwnershipTab({ data }: { data: OwnershipTab }) {
  const pledgeHigh =
    data.promoterPledge.available && data.promoterPledge.value > 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} size="lg" showDot />
        <p className="text-sm text-slate-500">Ownership verdict</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
      </div>

      {pledgeHigh && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] p-4">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm font-medium text-red-300">
            Promoter pledge above 10% — pledged shares can be sold by lenders if the stock falls, creating additional downward pressure.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Promoter Holding" metric={data.promoterHolding} format={(v) => formatPercent(Number(v))} />
        <StatCard
          label="Promoter Pledge"
          metric={data.promoterPledge}
          format={(v) => formatPercent(Number(v))}
          note={!pledgeHigh && data.promoterPledge.available && data.promoterPledge.value === 0 ? "No pledge" : undefined}
        />
        <StatCard label="FII Holding"    metric={data.fiiHolding}    format={(v) => formatPercent(Number(v))} />
        <StatCard label="DII Holding"    metric={data.diiHolding}    format={(v) => formatPercent(Number(v))} />
        <StatCard label="Public Holding" metric={data.publicHolding}  format={(v) => formatPercent(Number(v))} />
      </div>

      {data.trend.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Quarterly Trend
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {["Quarter", "Promoter %", "FII %", "DII %"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600 [&:not(:first-child)]:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.trend.map((q) => (
                  <tr key={q.quarter} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 font-medium text-slate-300">{q.quarter}</td>
                    <td className="px-4 py-2.5 text-right font-mono-num text-slate-400">
                      {q.promoter.available ? formatPercent(q.promoter.value) : <DataUnavailable />}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-num text-slate-400">
                      {q.fii.available ? formatPercent(q.fii.value) : <DataUnavailable />}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-num text-slate-400">
                      {q.dii.available ? formatPercent(q.dii.value) : <DataUnavailable />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
