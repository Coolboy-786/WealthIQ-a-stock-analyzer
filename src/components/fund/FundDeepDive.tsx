"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FundReport } from "@/types/fund-report";
import { FundSnapshotTab }    from "./tabs/FundSnapshotTab";
import { FundPerformanceTab } from "./tabs/FundPerformanceTab";
import { FundRiskTab }        from "./tabs/FundRiskTab";
import { BorderBeam } from "@/components/magicui/border-beam";
import { cn } from "@/lib/utils";
import { CalendarDays, ExternalLink } from "lucide-react";

const TABS = [
  { id: "snapshot",    label: "Snapshot"    },
  { id: "performance", label: "Performance" },
  { id: "risk",        label: "Risk"        },
] as const;

type TabId = typeof TABS[number]["id"];

export function FundDeepDive({ report }: { report: FundReport }) {
  const [activeTab, setActiveTab] = useState<TabId>("snapshot");

  const isEtf       = report.isEtf;
  const beamFrom    = isEtf ? "#F59E0B" : "#10B981";
  const beamTo      = isEtf ? "#F97316" : "#3B82F6";
  const typeBadge   = isEtf
    ? "bg-amber-500/15 text-amber-400"
    : "bg-emerald-500/15 text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="w-full max-w-5xl mx-auto space-y-4"
    >
      {/* ── Report header ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-slate-900/80 p-5 backdrop-blur-sm sm:p-6">
        <BorderBeam size={80} duration={10} colorFrom={beamFrom} colorTo={beamTo} borderWidth={1} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">
                {report.name}
              </h1>
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", typeBadge)}>
                {isEtf ? "ETF" : "Mutual Fund"}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {report.fundHouse} · {report.category}
            </p>
          </div>

          {/* NAV */}
          <div className="flex flex-col items-end gap-1">
            <p className="font-mono-num text-2xl font-bold text-slate-100">
              ₹{report.currentNav.toFixed(2)}
            </p>
            <p className="text-xs text-slate-600">NAV · {report.dataAsOf}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.05] pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
            Inception: {report.inceptionDate}
          </span>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
            AMFI · mfapi.in
          </span>
          <a
            href={`https://www.amfiindia.com/nav-history-download?SchCode=${report.schemeCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            AMFI
          </a>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-900/80 backdrop-blur-sm">
        <div className="relative flex min-w-max">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const isLast   = idx === TABS.length - 1;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
                  !isLast && "border-r border-white/[0.05]",
                  isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300",
                )}
                aria-selected={isActive}
                role="tab"
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="fund-tab-underline"
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
            {activeTab === "snapshot"    && <FundSnapshotTab    data={report} />}
            {activeTab === "performance" && <FundPerformanceTab data={report} />}
            {activeTab === "risk"        && <FundRiskTab        data={report} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <p className="px-1 text-[11px] leading-relaxed text-slate-700">
        {report.disclaimer}
      </p>
    </motion.div>
  );
}
