import type {
  ValuationVerdict,
  GrowthVerdict,
  HealthVerdict,
  ReturnsVerdict,
  OwnershipVerdict,
  OverallQuality,
  DataConfidence,
} from "./verdicts";

// ---------------------------------------------------------------------------
// Core building block
// Absence is declared, never silent. No defaulting to 0 or null.
// ---------------------------------------------------------------------------
export type Metric<T = number> =
  | { available: true;  value: T }
  | { available: false };

export interface ChartPoint {
  label: string;        // "FY22" | "Q1 FY25"
  value: Metric<number>;
}

export interface DataSource {
  name:      string;
  url?:      string;
  fetchedAt: string;   // ISO-8601
}

// ---------------------------------------------------------------------------
// Tab types
// ---------------------------------------------------------------------------

export interface SnapshotTab {
  companyName:        string;
  ticker:             string;
  exchange:           "NSE" | "BSE";
  sector:             string;
  industry:           string;
  description:        string;   // 2-3 sentence plain-English business description
  marketCapCrore:     Metric;
  marketCapCategory:  Metric<"Large Cap" | "Mid Cap" | "Small Cap" | "Micro Cap">;
  currentPrice:       Metric;
  fiftyTwoWeekHigh:   Metric;
  fiftyTwoWeekLow:    Metric;
  narrative:          string;   // AI-generated or hand-written for seed data
}

export interface ValuationTab {
  verdict:        ValuationVerdict;
  narrative:      string;
  peRatio:        Metric;
  pbRatio:        Metric;
  evEbitda:       Metric;
  priceToSales:   Metric;
  sectorMedianPE: Metric;
  // Mechanical TTM-earnings intrinsic value band — NOT a price target or forecast
  ivBand:         Metric<{ low: number; high: number }>;
  chartData:      ChartPoint[];   // PE over time
}

export interface GrowthTab {
  verdict:           GrowthVerdict;
  narrative:         string;
  revenueGrowth3Y:   Metric;   // CAGR %
  profitGrowth3Y:    Metric;
  epsGrowth3Y:       Metric;
  revenueGrowthTTM:  Metric;
  profitGrowthTTM:   Metric;
  chartData:         ChartPoint[];   // annual revenue ₹ Cr
}

export interface HealthTab {
  verdict:                 HealthVerdict;
  narrative:               string;
  debtToEquity:            Metric;
  interestCoverageRatio:   Metric;
  currentRatio:            Metric;
  cashAndEquivalentsCrore: Metric;
  operatingCashFlowCrore:  Metric;
  freeCashFlowCrore:       Metric;
  chartData:               ChartPoint[];   // D/E trend
}

export interface ReturnsTab {
  verdict:         ReturnsVerdict;
  narrative:       string;
  roe:             Metric;   // %
  roce:            Metric;
  roa:             Metric;
  operatingMargin: Metric;
  netMargin:       Metric;
  chartData:       ChartPoint[];   // ROE trend
}

export interface PeerRow {
  ticker:          string;
  name:            string;
  marketCapCrore:  Metric;
  peRatio:         Metric;
  pbRatio:         Metric;
  roe:             Metric;
  revenueGrowth3Y: Metric;
  debtToEquity:    Metric;
}

export interface PeersTab {
  narrative: string;
  peers:     PeerRow[];
}

export interface OwnershipQuarter {
  quarter:  string;   // "Q3 FY25"
  promoter: Metric;
  fii:      Metric;
  dii:      Metric;
}

export interface OwnershipTab {
  verdict:         OwnershipVerdict;
  narrative:       string;
  promoterHolding: Metric;   // % current
  promoterPledge:  Metric;   // % of promoter stake pledged
  fiiHolding:      Metric;
  diiHolding:      Metric;
  publicHolding:   Metric;
  trend:           OwnershipQuarter[];   // last 4-6 quarters
}

export interface TheViewTab {
  overallQuality:  OverallQuality;
  dataConfidence:  DataConfidence;
  strengths:       string[];
  watchPoints:     string[];
  oneThingToTrack: string;
  // Hardcoded constant from src/lib/narrative/prompt.ts — never AI-generated
  disclaimer:      string;
}

// ---------------------------------------------------------------------------
// Root report object
// Cache key: `${ticker}:${dataAsOf}`
// ---------------------------------------------------------------------------
export interface DeepDiveReport {
  ticker:      string;
  exchange:    "NSE" | "BSE";
  generatedAt: string;   // ISO-8601
  dataAsOf:    string;   // "Q3 FY25"
  sources:     DataSource[];
  snapshot:    SnapshotTab;
  valuation:   ValuationTab;
  growth:      GrowthTab;
  health:      HealthTab;
  returns:     ReturnsTab;
  peers:       PeersTab;
  ownership:   OwnershipTab;
  theView:     TheViewTab;
}
