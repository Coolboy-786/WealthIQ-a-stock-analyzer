import type { ValuationVerdict } from "@/types/verdicts";
import { VALUATION } from "./thresholds";

/**
 * Scores valuation verdict from PE ratio relative to sector median.
 * Falls back to "Cannot Rate" if either value missing.
 * SKILL.md: Cheap = well below sector + own history · Fair = within ~10% · Expensive = well above both
 */
export function scoreValuation(
  currentPE:    number | undefined,
  sectorPE:     number | undefined,
): ValuationVerdict {
  if (currentPE == null || sectorPE == null || sectorPE === 0) return "Cannot Rate";

  const cheapCutoff     = sectorPE * (1 - VALUATION.CHEAP_DISCOUNT_PCT / 100);
  const expensiveCutoff = sectorPE * (1 + VALUATION.EXPENSIVE_PREMIUM_PCT / 100);

  if (currentPE < cheapCutoff)     return "Cheap";
  if (currentPE > expensiveCutoff) return "Expensive";
  return "Fair";
}
