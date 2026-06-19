// Numeric constants extracted verbatim from SKILL.md "Signal thresholds" section.
// Any change here must be reflected in SKILL.md and vice versa.

export const VALUATION = {
  // % deviation from sector median to be considered "well below" (Cheap) or "well above" (Expensive)
  CHEAP_DISCOUNT_PCT:    15,   // current PE < sector * (1 - 0.15)
  EXPENSIVE_PREMIUM_PCT: 10,   // current PE > sector * (1 + 0.10) — "within ~10% = Fair"
} as const;

export const DEBT = {
  DE_SAFE:      1.0,   // D/E < 1   → Safe
  DE_MODERATE:  2.0,   // D/E 1–2   → Moderate
  // D/E > 2 → Leveraged
} as const;

export const COVERAGE = {
  HEALTHY: 3.0,    // > 3×  → Healthy
  WATCH:   1.5,    // 1.5–3× → Watch
  // < 1.5× → Risk
} as const;

export const CURRENT_RATIO = {
  COMFORTABLE: 1.5,   // > 1.5 → Comfortable
  WATCH:       1.0,   // 1–1.5 → Watch
  // < 1 → Risk
} as const;

export const RETURNS = {
  ROE_GOOD:    15,   // > 15% Good
  ROE_AVERAGE: 10,   // 10–15% Average
  // < 10% Weak

  ROCE_GOOD:    15,  // > 15%
  ROCE_AVERAGE: 10,  // 10–15%
  // < 10% Weak

  // Verdict combos (from SKILL.md health/returns mapping)
  RETURNS_EXCELLENT_ROE:  20,   // ROE > 20% AND ROCE > 15% → Excellent
  RETURNS_EXCELLENT_ROCE: 15,
  RETURNS_GOOD_ROE:       15,   // ROE > 15% OR ROCE > 12% → Good
  RETURNS_GOOD_ROCE:      12,
  RETURNS_AVERAGE_ROE_LO: 10,   // ROE 10–15% AND ROCE 8–12% → Average
  RETURNS_AVERAGE_ROCE_LO: 8,
  // else → Poor
} as const;

export const GROWTH = {
  STRONG:   20,   // 3Y revenue CAGR > 20%
  MODERATE: 10,   // 10–20%
  WEAK:      5,   // 5–10%
  // < 5% or negative → Declining
} as const;

export const HEALTH = {
  // Strong: D/E < 0.5 AND coverage > 4 AND current ratio > 1.5
  STRONG_DE:       0.5,
  STRONG_COVERAGE: 4.0,
  STRONG_CR:       1.5,
  // Adequate: D/E 0.5–1 OR coverage 2–4 OR CR 1–1.5
  ADEQUATE_DE:       1.0,
  ADEQUATE_COVERAGE: 2.0,
  ADEQUATE_CR:       1.0,
  // Stretched: D/E 1–2 OR coverage 1.5–2
  STRETCHED_DE:       2.0,
  STRETCHED_COVERAGE: 1.5,
  // else → Distressed
} as const;

export const OWNERSHIP = {
  HIGH_CONVICTION_PROMOTER: 50,   // ≥ 50%
  HIGH_CONVICTION_PLEDGE:    0,   // = 0 (no pledge)
  MIXED_PROMOTER:           30,   // ≥ 30%
  MIXED_PLEDGE_MAX:         10,   // pledge < 10%
  CONCERNING_PLEDGE_MIN:    10,   // pledge > 10% → always Concerning
} as const;

export const DISCLAIMER =
  "This is a view of the fundamentals for educational purposes — not investment advice " +
  "and not a buy/sell/hold recommendation. Verify figures independently. The decision is yours.";
