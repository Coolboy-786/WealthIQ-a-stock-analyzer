import type { FundReport } from "@/types/fund-report";
import { FundDeepDive } from "@/components/fund/FundDeepDive";

interface Props {
  schemeCode: number;
}

async function fetchFundReport(schemeCode: number): Promise<FundReport | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/fund/${schemeCode}`, {
      cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
      next:  process.env.NODE_ENV === "development" ? undefined : { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<FundReport>;
  } catch {
    return null;
  }
}

export async function FundLoader({ schemeCode }: Props) {
  const report = await fetchFundReport(schemeCode);

  if (!report) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-6 text-center">
        <p className="text-sm text-rose-400">Failed to load fund data — AMFI may be temporarily unavailable.</p>
        <p className="mt-1 text-xs text-slate-600">Try refreshing in a moment.</p>
      </div>
    );
  }

  return <FundDeepDive report={report} />;
}
