import type { PeersTab } from "@/types/report";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import { formatCrore, formatNumber, formatPercent } from "@/lib/utils";

export function PeersTab({ data }: { data: PeersTab }) {
  return (
    <div className="space-y-6">
      {data.narrative && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-sm leading-relaxed text-slate-400">{data.narrative}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {["Company", "Mkt Cap", "P/E", "P/B", "ROE", "Rev Growth 3Y", "D/E"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600 first:text-left last:text-right [&:not(:first-child)]:text-right"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {data.peers.map((peer) => (
              <tr key={peer.ticker} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-200">{peer.name}</p>
                  <p className="font-mono-num text-xs text-slate-600">{peer.ticker}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.marketCapCrore.available ? formatCrore(peer.marketCapCrore.value) : <DataUnavailable />}
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.peRatio.available ? `${formatNumber(peer.peRatio.value)}×` : <DataUnavailable />}
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.pbRatio.available ? `${formatNumber(peer.pbRatio.value)}×` : <DataUnavailable />}
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.roe.available ? formatPercent(peer.roe.value) : <DataUnavailable />}
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.revenueGrowth3Y.available ? formatPercent(peer.revenueGrowth3Y.value) : <DataUnavailable />}
                </td>
                <td className="px-4 py-3 text-right font-mono-num text-slate-400">
                  {peer.debtToEquity.available ? formatNumber(peer.debtToEquity.value) : <DataUnavailable />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
