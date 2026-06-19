import type { GrowthTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MiniChart } from "../MiniChart";

export function GrowthTab({ data }: { data: GrowthTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} size="lg" showDot />
        <p className="text-sm text-slate-500">Growth verdict</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">3-Year CAGR</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Revenue Growth" metric={data.revenueGrowth3Y} ticker tickerDecimals={1} tickerSuffix="%" note="3Y CAGR" />
          <StatCard label="Profit Growth"  metric={data.profitGrowth3Y}  ticker tickerDecimals={1} tickerSuffix="%" note="3Y CAGR" />
          <StatCard label="EPS Growth"     metric={data.epsGrowth3Y}     ticker tickerDecimals={1} tickerSuffix="%" note="3Y CAGR" />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Trailing Twelve Months</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Revenue Growth TTM" metric={data.revenueGrowthTTM} ticker tickerDecimals={1} tickerSuffix="%" />
          <StatCard label="Profit Growth TTM"  metric={data.profitGrowthTTM}  ticker tickerDecimals={1} tickerSuffix="%" />
        </div>
      </div>

      {data.chartData.length > 0 && (
        <MiniChart data={data.chartData} type="bar" color="#10B981" label="Annual revenue (₹ Cr)" />
      )}
    </div>
  );
}
