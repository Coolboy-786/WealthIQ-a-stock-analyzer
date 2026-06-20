import type { SnapshotTab } from "@/types/report";
import { StatCard } from "@/components/ui/stat-card";
import { StockPriceChart } from "@/components/deep-dive/StockPriceChart";
import { formatCrore, formatPrice } from "@/lib/utils";

export function SnapshotTab({ data }: { data: SnapshotTab }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-slate-400">{data.description}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Market Cap"   metric={data.marketCapCrore}    format={(v) => formatCrore(Number(v))} />
        <StatCard label="Category"     metric={data.marketCapCategory} format={(v) => String(v)} />
        <StatCard label="Price"        metric={data.currentPrice}      format={(v) => formatPrice(Number(v))} highlight />
        <StatCard label="52W High"     metric={data.fiftyTwoWeekHigh}  format={(v) => formatPrice(Number(v))} />
        <StatCard label="52W Low"      metric={data.fiftyTwoWeekLow}   format={(v) => formatPrice(Number(v))} />
      </div>

      {data.narrative && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-400">
            At a Glance
          </p>
          <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
        </div>
      )}

      <StockPriceChart ticker={data.ticker} exchange={data.exchange} />

      <div className="flex flex-wrap gap-1.5">
        {[data.sector, data.industry, data.exchange].map((tag, i) => (
          <span key={i} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
