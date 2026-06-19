import type { ReturnsTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MiniChart } from "../MiniChart";

export function ReturnsTab({ data }: { data: ReturnsTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} size="lg" showDot />
        <p className="text-sm text-slate-500">Capital returns verdict</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="ROE"              metric={data.roe}             ticker tickerDecimals={1} tickerSuffix="%" note="Return on Equity" />
        <StatCard label="ROCE"             metric={data.roce}            ticker tickerDecimals={1} tickerSuffix="%" note="Return on Capital Employed" />
        <StatCard label="ROA"              metric={data.roa}             ticker tickerDecimals={1} tickerSuffix="%" note="Return on Assets" />
        <StatCard label="Operating Margin" metric={data.operatingMargin} ticker tickerDecimals={1} tickerSuffix="%" />
        <StatCard label="Net Margin"       metric={data.netMargin}       ticker tickerDecimals={1} tickerSuffix="%" />
      </div>

      {data.chartData.length > 0 && (
        <MiniChart data={data.chartData} type="line" color="#8B5CF6" label="ROE — trend (%)" />
      )}
    </div>
  );
}
