import type { FundReport } from "@/types/fund-report";
import { StatCard } from "@/components/ui/stat-card";
import { formatPercent } from "@/lib/utils";

interface RiskItemProps {
  title:       string;
  description: string;
}

function RiskExplainer({ title, description }: RiskItemProps) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <p className="mb-1 text-xs font-semibold text-slate-400">{title}</p>
      <p className="text-xs leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

export function FundRiskTab({ data }: { data: FundReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Volatility (1Y)"
          metric={data.volatility}
          format={(v) => formatPercent(Number(v))}
          note="Annualized std dev"
        />
        <StatCard
          label="Max Drawdown"
          metric={data.maxDrawdown}
          format={(v) => `-${formatPercent(Number(v))}`}
          note="Peak-to-trough, all-time"
        />
        <StatCard
          label="Sharpe Ratio (1Y)"
          metric={data.sharpeRatio}
          format={(v) => Number(v).toFixed(2)}
          note="Risk-free = 6.5%"
        />
      </div>

      <div className="space-y-2">
        <RiskExplainer
          title="Volatility"
          description="Annualized standard deviation of daily returns over the past year. Higher = more price swings. Below 10% is low, 10–20% moderate, above 20% high for equity funds."
        />
        <RiskExplainer
          title="Max Drawdown"
          description="Largest peak-to-trough decline in NAV since inception. Shows the worst loss an investor could have experienced if they bought at a peak and sold at a trough."
        />
        <RiskExplainer
          title="Sharpe Ratio"
          description="1-year excess return over the 6.5% risk-free rate, divided by volatility. Above 1.0 is good — you're getting more return per unit of risk taken."
        />
      </div>

      <p className="text-[11px] text-slate-600">
        Risk metrics computed from historical NAV data via AMFI. AUM, expense ratio, and portfolio composition not available from this data source.
      </p>
    </div>
  );
}
