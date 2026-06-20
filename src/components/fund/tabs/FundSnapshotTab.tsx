import type { FundReport } from "@/types/fund-report";
import { StatCard } from "@/components/ui/stat-card";
import { formatPercent } from "@/lib/utils";

export function FundSnapshotTab({ data }: { data: FundReport }) {
  const accentClass = data.isEtf
    ? "border-amber-500/25 bg-amber-500/[0.07]"
    : "border-emerald-500/25 bg-emerald-500/[0.07]";
  const accentText  = data.isEtf ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className={`rounded-xl border p-4 ${accentClass}`}>
        <p className={`mb-0.5 text-[10px] font-semibold uppercase tracking-widest ${accentText}`}>
          {data.isEtf ? "Exchange Traded Fund" : "Mutual Fund"} · Direct Growth
        </p>
        <p className="text-sm text-slate-400">
          {data.fundHouse} · {data.category}
        </p>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Current NAV"
          metric={{ available: true, value: data.currentNav }}
          format={(v) => `₹${Number(v).toFixed(2)}`}
          highlight
        />
        <StatCard
          label="1Y Return"
          metric={data.ret1y}
          format={(v) => formatPercent(Number(v))}
        />
        <StatCard
          label="Since Inception"
          metric={data.retAllTime}
          format={(v) => `${formatPercent(Number(v))} CAGR`}
          note={data.allTimeYears > 0 ? `${data.allTimeYears.toFixed(1)} yrs` : undefined}
        />
        <StatCard
          label="Inception Date"
          metric={{ available: true, value: data.inceptionDate }}
          format={(v) => String(v)}
        />
        <StatCard
          label="Data As Of"
          metric={{ available: true, value: data.dataAsOf }}
          format={(v) => String(v)}
        />
        <StatCard
          label="Category"
          metric={{ available: true, value: data.category }}
          format={(v) => String(v)}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[data.fundHouse, data.category, data.isEtf ? "ETF" : "Mutual Fund", "Direct Growth"].map((tag, i) => (
          <span
            key={i}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
