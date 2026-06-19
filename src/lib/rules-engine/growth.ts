import type { GrowthVerdict } from "@/types/verdicts";
import { GROWTH } from "./thresholds";

/**
 * Scores growth verdict from 3-year revenue CAGR.
 * SKILL.md: >20% Strong · 10–20% Moderate · 5–10% Weak · <5% or negative Declining
 */
export function scoreGrowth(revenueGrowth3Y: number | undefined): GrowthVerdict {
  if (revenueGrowth3Y == null) return "Cannot Rate";
  if (revenueGrowth3Y > GROWTH.STRONG)   return "Strong";
  if (revenueGrowth3Y > GROWTH.MODERATE) return "Moderate";
  if (revenueGrowth3Y > GROWTH.WEAK)     return "Weak";
  return "Declining";
}
