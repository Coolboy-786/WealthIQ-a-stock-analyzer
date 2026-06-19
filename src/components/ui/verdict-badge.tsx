"use client";

import { VERDICT_TIER, VERDICT_CLASSES } from "@/types/verdicts";
import { cn } from "@/lib/utils";

interface VerdictBadgeProps {
  verdict:  string;
  size?:    "xs" | "sm" | "md" | "lg";
  showDot?: boolean;
}

export function VerdictBadge({ verdict, size = "md", showDot = false }: VerdictBadgeProps) {
  const tier    = VERDICT_TIER[verdict] ?? "gray";
  const classes = VERDICT_CLASSES[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium leading-none",
        classes,
        size === "xs" && "px-1.5 py-0.5 text-[10px]",
        size === "sm" && "px-2   py-0.5 text-xs",
        size === "md" && "px-2.5 py-1   text-xs",
        size === "lg" && "px-3   py-1.5 text-sm",
      )}
    >
      {showDot && (
        <span className={cn(
          "rounded-full shrink-0",
          size === "xs" || size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5",
          tier === "green"  && "bg-emerald-400",
          tier === "amber"  && "bg-amber-400",
          tier === "orange" && "bg-orange-400",
          tier === "red"    && "bg-red-400",
          tier === "gray"   && "bg-slate-500",
        )} />
      )}
      {verdict}
    </span>
  );
}
