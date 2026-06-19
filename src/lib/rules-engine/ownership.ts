import type { OwnershipVerdict } from "@/types/verdicts";
import { OWNERSHIP } from "./thresholds";

/**
 * Scores ownership verdict.
 * SKILL.md mapping:
 *   High Conviction: promoter ≥ 50% AND pledge = 0
 *   Mixed:           promoter ≥ 30% AND pledge < 10%
 *   Concerning:      pledge > 10% OR promoter declining trend
 */
export function scoreOwnership(
  promoterHolding?:  number,   // current %
  promoterPledge?:   number,   // % of promoter stake pledged
  promoterDeclining?: boolean, // true if trend is down over last 4 quarters
): OwnershipVerdict {
  if (promoterHolding == null) return "Cannot Rate";

  // Pledge > 10% always → Concerning
  if (promoterPledge != null && promoterPledge > OWNERSHIP.CONCERNING_PLEDGE_MIN) return "Concerning";

  // Declining trend (even without pledge) → Concerning
  if (promoterDeclining) return "Concerning";

  if (
    promoterHolding >= OWNERSHIP.HIGH_CONVICTION_PROMOTER &&
    (promoterPledge == null || promoterPledge === OWNERSHIP.HIGH_CONVICTION_PLEDGE)
  ) return "High Conviction";

  if (
    promoterHolding >= OWNERSHIP.MIXED_PROMOTER &&
    (promoterPledge == null || promoterPledge < OWNERSHIP.MIXED_PLEDGE_MAX)
  ) return "Mixed";

  return "Concerning";
}

/**
 * Returns true if promoter holding has declined over the trend array (newest first).
 */
export function isPromoterDeclining(
  trend: { promoter?: number }[],
): boolean {
  const values = trend
    .map((q) => q.promoter)
    .filter((v): v is number => v != null);
  if (values.length < 2) return false;
  // Newest first — declining means first < last
  return values[0] < values[values.length - 1];
}
