"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DeepDiveReport } from "@/types/report";
import { VERDICT_TIER, VERDICT_DOT } from "@/types/verdicts";
import { SnapshotTab }  from "./tabs/SnapshotTab";
import { ValuationTab } from "./tabs/ValuationTab";
import { GrowthTab }    from "./tabs/GrowthTab";
import { HealthTab }    from "./tabs/HealthTab";
import { ReturnsTab }   from "./tabs/ReturnsTab";
import { PeersTab }     from "./tabs/PeersTab";
import { OwnershipTab } from "./tabs/OwnershipTab";
import { TheViewTab }   from "./tabs/TheViewTab";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import { cn } from "@/lib/utils";
import { CalendarDays, Database } from "lucide-react";

const TABS = [
  { id: "snapshot",  label: "Snapshot",  verdictKey: null },
  { id: "valuation", label: "Valuation", verdictKey: "valuation" },
  { id: "growth",    label: "Growth",    verdictKey: "growth" },
  { id: "health",    label: "Health",    verdictKey: "health" },
  { id: "returns",   label: "Returns",   verdictKey: "returns" },
  { id: "peers",     label: "Peers",     verdictKey: null },
  { id: "ownership", label: "Ownership", verdictKey: "ownership" },
  { id: "theview",   label: "The View",  verdictKey: null },
] as const;

type TabId = typeof TABS[number]["id"];

function getVerdict(report: DeepDiveReport, key: string | null): string | null {
  if (!key) return null;
  const map: Record<string, string> = {
    valuation: report.valuation.verdict,
    growth:    report.growth.verdict,
    health:    report.health.verdict,
    returns:   report.returns.verdict,
    ownership: report.ownership.verdict,
  };
  return map[key] ?? null;
}

export function DeepDive({ report }: { report: DeepDiveReport }) {
  const [activeTab, setActiveTab] = useState<TabId>("snapshot");

  const qualityTier = VERDICT_TIER[report.theView.overallQuality] ?? "gray";
  const dotClass    = VERDICT_DOT[qualityTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="w-full max-w-5xl mx-auto space-y-4"
    >
      {/* ── Report header ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-slate-900/80 p-5 backdrop-blur-sm sm:p-6">
        <BorderBeam size={80} duration={10} colorFrom="#3B82F6" colorTo="#8B5CF6" borderWidth={1} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: identity */}
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
                {report.snapshot.companyName}
              </h1>
              <span className="font-mono-num rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs font-semibold text-slate-400">
                {report.ticker}
              </span>
              <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">
                {report.exchange}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {report.snapshot.sector} · {report.snapshot.industry}
            </p>
          </div>

          {/* Right: overall quality + confidence */}
          <div className="flex flex-col items-end gap-1.5">
            <VerdictBadge verdict={report.theView.overallQuality} size="md" showDot />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
              {report.theView.dataConfidence} data confidence
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.05] pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
            Data as of {report.dataAsOf}
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="h-3 w-3" strokeWidth={1.75} />
            {report.sources.map((s) => s.name).join(" · ")}
          </span>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-900/80 backdrop-blur-sm">
        <div className="relative flex min-w-max">
          {TABS.map((tab, idx) => {
            const verdict  = getVerdict(report, tab.verdictKey);
            const tier     = verdict ? (VERDICT_TIER[verdict] ?? "gray") : null;
            const dot      = tier ? VERDICT_DOT[tier] : null;
            const isActive = activeTab === tab.id;
            const isLast   = idx === TABS.length - 1;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                  !isLast && "border-r border-white/[0.05]",
                  isActive
                    ? "text-blue-400"
                    : "text-slate-500 hover:text-slate-300",
                )}
                aria-selected={isActive}
                role="tab"
              >
                {tab.label}
                {dot && (
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} aria-hidden="true" />
                )}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-blue-500"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-900/80 p-5 backdrop-blur-sm sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {activeTab === "snapshot"  && <SnapshotTab  data={report.snapshot}  />}
            {activeTab === "valuation" && <ValuationTab data={report.valuation} />}
            {activeTab === "growth"    && <GrowthTab    data={report.growth}    />}
            {activeTab === "health"    && <HealthTab    data={report.health}    />}
            {activeTab === "returns"   && <ReturnsTab   data={report.returns}   />}
            {activeTab === "peers"     && <PeersTab     data={report.peers}     />}
            {activeTab === "ownership" && <OwnershipTab data={report.ownership} />}
            {activeTab === "theview"   && <TheViewTab   data={report.theView}   />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
