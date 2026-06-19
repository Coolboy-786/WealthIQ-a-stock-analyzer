export type ValuationVerdict  = "Cheap" | "Fair" | "Expensive" | "Cannot Rate";
export type GrowthVerdict     = "Strong" | "Moderate" | "Weak" | "Declining" | "Cannot Rate";
export type HealthVerdict     = "Strong" | "Adequate" | "Stretched" | "Distressed" | "Cannot Rate";
export type ReturnsVerdict    = "Excellent" | "Good" | "Average" | "Poor" | "Cannot Rate";
export type OwnershipVerdict  = "High Conviction" | "Mixed" | "Concerning" | "Cannot Rate";
export type OverallQuality    = "High" | "Medium" | "Low" | "Cannot Rate";
export type DataConfidence    = "High" | "Medium" | "Low";

export type AnyVerdict =
  | ValuationVerdict
  | GrowthVerdict
  | HealthVerdict
  | ReturnsVerdict
  | OwnershipVerdict
  | OverallQuality;

export type VerdictTier = "green" | "amber" | "orange" | "red" | "gray";

export const VERDICT_TIER: Record<string, VerdictTier> = {
  // Green tier
  Cheap:             "green",
  Strong:            "green",
  Excellent:         "green",
  "High Conviction": "green",
  High:              "green",

  // Amber tier
  Fair:              "amber",
  Moderate:          "amber",
  Good:              "amber",
  Adequate:          "amber",
  Mixed:             "amber",
  Medium:            "amber",

  // Orange tier
  Weak:              "orange",
  Stretched:         "orange",
  Average:           "orange",

  // Red tier
  Expensive:         "red",
  Poor:              "red",
  Declining:         "red",
  Distressed:        "red",
  Concerning:        "red",
  Low:               "red",

  // Gray
  "Cannot Rate":     "gray",
};

export const VERDICT_CLASSES: Record<VerdictTier, string> = {
  green:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  amber:  "text-amber-400   bg-amber-500/10   border-amber-500/25",
  orange: "text-orange-400  bg-orange-500/10  border-orange-500/25",
  red:    "text-red-400     bg-red-500/10     border-red-500/25",
  gray:   "text-slate-500   bg-slate-500/10   border-slate-500/20",
};

export const VERDICT_DOT: Record<VerdictTier, string> = {
  green:  "bg-emerald-400",
  amber:  "bg-amber-400",
  orange: "bg-orange-400",
  red:    "bg-red-400",
  gray:   "bg-slate-500",
};
