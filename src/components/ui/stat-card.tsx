import type { Metric } from "@/types/report";
import { DataUnavailable } from "./data-unavailable";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label:       string;
  metric:      Metric<number | string>;
  format?:     (v: number | string) => string;
  note?:       string;
  highlight?:  boolean;
  className?:  string;
  /** When true, animates the raw number value with NumberTicker then applies prefix/suffix */
  ticker?:     boolean;
  tickerDecimals?: number;
  tickerPrefix?: string;
  tickerSuffix?: string;
}

export function StatCard({
  label, metric, format, note, highlight, className,
  ticker = false, tickerDecimals = 0, tickerPrefix = "", tickerSuffix = "",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-4 transition-all duration-200",
        highlight
          ? "border-blue-500/25 bg-blue-500/[0.07] hover:border-blue-500/40"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10",
        className,
      )}
    >
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {metric.available ? (
        ticker && typeof metric.value === "number" ? (
          <p className={cn(
            "font-mono-num text-xl font-semibold leading-none",
            highlight ? "text-blue-400" : "text-slate-100",
          )}>
            {tickerPrefix}
            <NumberTicker
              value={metric.value}
              decimalPlaces={tickerDecimals}
              className={highlight ? "text-blue-400" : "text-slate-100"}
            />
            {tickerSuffix}
          </p>
        ) : (
          <p className={cn(
            "font-mono-num text-xl font-semibold leading-none",
            highlight ? "text-blue-400" : "text-slate-100",
          )}>
            {format ? format(metric.value) : String(metric.value)}
          </p>
        )
      ) : (
        <DataUnavailable />
      )}
      {note && (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-600">{note}</p>
      )}
    </div>
  );
}
