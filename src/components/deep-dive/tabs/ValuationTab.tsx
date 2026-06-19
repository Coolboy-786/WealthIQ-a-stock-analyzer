import type { ValuationTab } from "@/types/report";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { StatCard } from "@/components/ui/stat-card";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import { MiniChart } from "../MiniChart";
import { formatNumber, formatPrice } from "@/lib/utils";

export function ValuationTab({ data }: { data: ValuationTab }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={data.verdict} size="lg" showDot />
        <p className="text-sm text-slate-500">Valuation verdict</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="P/E Ratio"         metric={data.peRatio}        ticker tickerDecimals={1} tickerSuffix="×" />
        <StatCard label="P/B Ratio"         metric={data.pbRatio}        ticker tickerDecimals={1} tickerSuffix="×" />
        <StatCard label="EV / EBITDA"       metric={data.evEbitda}       ticker tickerDecimals={1} tickerSuffix="×" />
        <StatCard label="Price / Sales"     metric={data.priceToSales}   ticker tickerDecimals={1} tickerSuffix="×" />
        <StatCard label="Sector Median P/E" metric={data.sectorMedianPE} ticker tickerDecimals={1} tickerSuffix="×" />

        <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Intrinsic Value Band
          </p>
          {data.ivBand.available ? (
            <p className="font-mono-num text-xl font-semibold text-slate-100">
              {formatPrice(data.ivBand.value.low)}
              <span className="mx-1 text-base text-slate-600">–</span>
              {formatPrice(data.ivBand.value.high)}
            </p>
          ) : (
            <DataUnavailable />
          )}
          <p className="mt-1.5 text-[11px] text-slate-600">Mechanical range, not a target</p>
        </div>
      </div>

      {data.chartData.length > 0 && (
        <MiniChart data={data.chartData} type="line" color="#3B82F6" label="P/E ratio — historical" />
      )}
    </div>
  );
}
