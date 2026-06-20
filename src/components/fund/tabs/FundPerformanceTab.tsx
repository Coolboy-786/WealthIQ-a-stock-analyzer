"use client";

import type { FundReport } from "@/types/fund-report";
import type { Metric } from "@/types/report";
import { NavChart } from "../NavChart";
import { cn } from "@/lib/utils";

interface ReturnRowProps {
  label:   string;
  metric:  Metric<number>;
  isCAGR?: boolean;
}

function ReturnRow({ label, metric, isCAGR }: ReturnRowProps) {
  const color = metric.available
    ? metric.value >= 15  ? "text-emerald-400"
    : metric.value >= 5   ? "text-blue-400"
    : metric.value >= 0   ? "text-amber-400"
    : "text-rose-400"
    : "text-slate-600";

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        {metric.available ? (
          <>
            <span className={cn("font-mono-num text-sm font-semibold", color)}>
              {metric.value > 0 ? "+" : ""}{metric.value.toFixed(1)}%
            </span>
            {isCAGR && (
              <span className="rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                CAGR
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        )}
      </div>
    </div>
  );
}

export function FundPerformanceTab({ data }: { data: FundReport }) {
  const chartColor = data.isEtf ? "#F59E0B" : "#10B981";

  return (
    <div className="space-y-6">
      {/* Returns table */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Returns
        </p>
        <div className="space-y-1.5">
          <ReturnRow label="1 Month"           metric={data.ret1m}       />
          <ReturnRow label="3 Months"          metric={data.ret3m}       />
          <ReturnRow label="6 Months"          metric={data.ret6m}       />
          <ReturnRow label="1 Year"            metric={data.ret1y}       />
          <ReturnRow label="3 Years"           metric={data.ret3yCagr}   isCAGR />
          <ReturnRow label="5 Years"           metric={data.ret5yCagr}   isCAGR />
          <ReturnRow label="10 Years"          metric={data.ret10yCagr}  isCAGR />
          <ReturnRow
            label={`Since Inception (${data.allTimeYears.toFixed(1)} yrs)`}
            metric={data.retAllTime}
            isCAGR
          />
        </div>
      </div>

      {/* NAV chart */}
      <NavChart
        histories={data.navHistories}
        color={chartColor}
        defaultPeriod="1y"
        valueLabel="NAV"
      />

      <p className="text-[11px] text-slate-600">
        Returns are point-to-point. 3Y+ figures are CAGR. Past performance does not indicate future results.
      </p>
    </div>
  );
}
