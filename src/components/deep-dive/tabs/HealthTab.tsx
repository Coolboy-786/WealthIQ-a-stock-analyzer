import type { HealthTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MiniChart } from "../MiniChart";
import { formatCrore, formatNumber } from "@/lib/utils";

export function HealthTab({ data }: { data: HealthTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} size="lg" showDot />
        <p className="text-sm text-slate-500">Financial health verdict</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Debt / Equity"      metric={data.debtToEquity}            format={(v) => formatNumber(Number(v))} />
        <StatCard label="Interest Coverage"  metric={data.interestCoverageRatio}   format={(v) => `${formatNumber(Number(v))}×`} />
        <StatCard label="Current Ratio"      metric={data.currentRatio}            format={(v) => formatNumber(Number(v))} />
        <StatCard label="Cash & Equivalents" metric={data.cashAndEquivalentsCrore} format={(v) => formatCrore(Number(v))} />
        <StatCard label="Operating CF"       metric={data.operatingCashFlowCrore}  format={(v) => formatCrore(Number(v))} />
        <StatCard label="Free Cash Flow"     metric={data.freeCashFlowCrore}       format={(v) => formatCrore(Number(v))} />
      </div>

      {data.chartData.some((p) => p.value.available) && (
        <MiniChart data={data.chartData} type="line" color="#F59E0B" label="Debt / Equity — trend" />
      )}
    </div>
  );
}
