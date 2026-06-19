import type { ReturnsVerdict } from "@/types/verdicts";
import { RETURNS } from "./thresholds";

/**
 * Scores capital returns verdict.
 * SKILL.md mapping:
 *   Excellent: ROE > 20% AND ROCE > 15%
 *   Good:      ROE > 15% OR  ROCE > 12%
 *   Average:   ROE 10–15% AND ROCE 8–12%
 *   Poor:      ROE < 10% OR  ROCE < 8%
 */
export function scoreReturns(roe?: number, roce?: number): ReturnsVerdict {
  if (roe == null && roce == null) return "Cannot Rate";

  if (
    roe  != null && roe  > RETURNS.RETURNS_EXCELLENT_ROE &&
    roce != null && roce > RETURNS.RETURNS_EXCELLENT_ROCE
  ) return "Excellent";

  if (
    (roe  != null && roe  > RETURNS.RETURNS_GOOD_ROE)  ||
    (roce != null && roce > RETURNS.RETURNS_GOOD_ROCE)
  ) return "Good";

  if (
    (roe  == null || (roe  >= RETURNS.RETURNS_AVERAGE_ROE_LO  && roe  <= RETURNS.RETURNS_GOOD_ROE))  &&
    (roce == null || (roce >= RETURNS.RETURNS_AVERAGE_ROCE_LO && roce <= RETURNS.RETURNS_GOOD_ROCE))
  ) return "Average";

  return "Poor";
}
