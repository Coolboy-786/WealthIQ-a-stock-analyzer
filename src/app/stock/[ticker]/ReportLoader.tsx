import fs from "fs";
import path from "path";
import type { DeepDiveReport } from "@/types/report";
import { DeepDive } from "@/components/deep-dive/DeepDive";
import { NoReportYet } from "@/components/deep-dive/NoReportYet";

interface Props {
  ticker:      string;
  companyName: string;
}

function loadSeedReport(ticker: string): DeepDiveReport | null {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "seed", `${ticker}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as DeepDiveReport;
  } catch {
    return null;
  }
}

async function fetchLiveReport(ticker: string): Promise<DeepDiveReport | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/report/${ticker}`, {
      cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
      next:  process.env.NODE_ENV === "development" ? undefined : { revalidate: 60 * 60 * 4 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<DeepDiveReport>;
  } catch {
    return null;
  }
}

export async function ReportLoader({ ticker, companyName }: Props) {
  const liveReport = await fetchLiveReport(ticker);
  const seedReport = liveReport === null ? loadSeedReport(ticker) : null;
  const report     = liveReport ?? seedReport;

  const isLive     = liveReport !== null;
  const isSeedOnly = liveReport === null && seedReport !== null;

  if (!report) {
    return <NoReportYet ticker={ticker} companyName={companyName} />;
  }

  return (
    <div className="space-y-3">
      {isSeedOnly && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-sm text-amber-400/90">
          Showing sample data — live analysis unavailable for this stock right now.
        </div>
      )}
      <DeepDive report={report} isLive={isLive} />
    </div>
  );
}
