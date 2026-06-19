import type { HealthVerdict } from "@/types/verdicts";
import { HEALTH } from "./thresholds";

/**
 * Scores financial health verdict.
 * SKILL.md mapping:
 *   Strong:    D/E < 0.5 AND coverage > 4 AND current ratio > 1.5
 *   Adequate:  D/E 0.5–1 OR coverage 2–4 OR current ratio 1–1.5
 *   Stretched: D/E 1–2 OR coverage 1.5–2
 *   Distressed: D/E > 2 OR coverage < 1.5
 */
export function scoreHealth(
  debtToEquity?:           number,
  interestCoverage?:       number,
  currentRatio?:           number,
): HealthVerdict {
  // Distressed takes priority — any single trigger is enough
  if (
    (debtToEquity    != null && debtToEquity    >  HEALTH.STRETCHED_DE)       ||
    (interestCoverage != null && interestCoverage < HEALTH.STRETCHED_COVERAGE)
  ) return "Distressed";

  // Stretched
  if (
    (debtToEquity    != null && debtToEquity    >  HEALTH.ADEQUATE_DE)         ||
    (interestCoverage != null && interestCoverage < HEALTH.ADEQUATE_COVERAGE)
  ) return "Stretched";

  // Strong — ALL three must pass; any missing → cannot confirm Strong
  if (
    debtToEquity     != null && debtToEquity    <  HEALTH.STRONG_DE   &&
    interestCoverage != null && interestCoverage > HEALTH.STRONG_COVERAGE &&
    currentRatio     != null && currentRatio    >  HEALTH.STRONG_CR
  ) return "Strong";

  // If any data missing or in the middle band → Adequate
  if (
    (debtToEquity     == null || debtToEquity    <= HEALTH.ADEQUATE_DE)  &&
    (interestCoverage == null || interestCoverage >= HEALTH.ADEQUATE_COVERAGE) &&
    (currentRatio     == null || currentRatio    >= HEALTH.ADEQUATE_CR)
  ) return "Adequate";

  return "Cannot Rate";
}
