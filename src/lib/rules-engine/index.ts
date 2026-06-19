import type { RawStockData } from "@/types/provider";
import type {
  DeepDiveReport,
  SnapshotTab,
  ValuationTab,
  GrowthTab,
  HealthTab,
  ReturnsTab,
  PeersTab,
  OwnershipTab,
  TheViewTab,
  Metric,
  ChartPoint,
} from "@/types/report";
import type { OverallQuality, DataConfidence } from "@/types/verdicts";

import { scoreValuation } from "./valuation";
import { scoreGrowth }    from "./growth";
import { scoreHealth }    from "./health";
import { scoreReturns }   from "./returns";
import { scoreOwnership, isPromoterDeclining } from "./ownership";
import { DISCLAIMER } from "./thresholds";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function m<T>(value: T | undefined | null): Metric<T> {
  return value != null ? { available: true, value } : { available: false };
}

function toChartPoints(
  labels: string[] | undefined,
  values: (number | undefined)[] | undefined,
): ChartPoint[] {
  if (!labels || !values) return [];
  return labels.map((label, i) => ({
    label,
    value: m(values[i]),
  }));
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

function buildSnapshot(raw: RawStockData): SnapshotTab {
  let category: "Large Cap" | "Mid Cap" | "Small Cap" | "Micro Cap" | undefined;
  if (raw.marketCapCrore != null) {
    if (raw.marketCapCrore >= 20000)      category = "Large Cap";
    else if (raw.marketCapCrore >= 5000)  category = "Mid Cap";
    else if (raw.marketCapCrore >= 500)   category = "Small Cap";
    else                                   category = "Micro Cap";
  }

  return {
    companyName:        raw.companyName,
    ticker:             raw.ticker,
    exchange:           raw.exchange,
    sector:             raw.sector,
    industry:           raw.industry,
    description:        raw.description,
    marketCapCrore:     m(raw.marketCapCrore),
    marketCapCategory:  m(category),
    currentPrice:       m(raw.currentPrice),
    fiftyTwoWeekHigh:   m(raw.fiftyTwoWeekHigh),
    fiftyTwoWeekLow:    m(raw.fiftyTwoWeekLow),
    narrative:          "",   // filled by narrative generator
  };
}

// ---------------------------------------------------------------------------
// Valuation
// ---------------------------------------------------------------------------

function buildValuation(raw: RawStockData): ValuationTab {
  const { valuation: v } = raw;
  const verdict = scoreValuation(v.peRatio, v.sectorMedianPE);

  const chartData = toChartPoints(
    v.peHistory?.map((p) => p.label),
    v.peHistory?.map((p) => p.value),
  );

  return {
    verdict,
    narrative:      "",   // filled by narrative generator
    peRatio:        m(v.peRatio),
    pbRatio:        m(v.pbRatio),
    evEbitda:       m(v.evEbitda),
    priceToSales:   m(v.priceToSales),
    sectorMedianPE: m(v.sectorMedianPE),
    ivBand:         { available: false },   // DCF band requires separate computation
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Growth
// ---------------------------------------------------------------------------

function buildGrowth(raw: RawStockData): GrowthTab {
  const { financials: f } = raw;
  const verdict = scoreGrowth(f.revenueGrowth3Y);

  const chartData = toChartPoints(f.revenueLabels, f.revenueCrore);

  return {
    verdict,
    narrative:        "",
    revenueGrowth3Y:  m(f.revenueGrowth3Y),
    profitGrowth3Y:   m(f.profitGrowth3Y),
    epsGrowth3Y:      m(f.epsGrowth3Y),
    revenueGrowthTTM: m(f.revenueGrowthTTM),
    profitGrowthTTM:  m(f.profitGrowthTTM),
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

function buildHealth(raw: RawStockData): HealthTab {
  const { balanceSheet: b, cashFlow: cf } = raw;
  const verdict = scoreHealth(b.debtToEquity, b.interestCoverageRatio, b.currentRatio);

  const chartData = toChartPoints(
    b.debtToEquityHistory?.map((p) => p.label),
    b.debtToEquityHistory?.map((p) => p.value),
  );

  return {
    verdict,
    narrative:               "",
    debtToEquity:            m(b.debtToEquity),
    interestCoverageRatio:   m(b.interestCoverageRatio),
    currentRatio:            m(b.currentRatio),
    cashAndEquivalentsCrore: m(b.cashAndEquivalentsCrore),
    operatingCashFlowCrore:  m(cf.operatingCashFlowCrore),
    freeCashFlowCrore:       m(cf.freeCashFlowCrore),
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Returns
// ---------------------------------------------------------------------------

function buildReturns(raw: RawStockData): ReturnsTab {
  const { returns: r, financials: f } = raw;
  const verdict = scoreReturns(r.roe, r.roce);

  const chartData = toChartPoints(
    r.roeHistory?.map((p) => p.label),
    r.roeHistory?.map((p) => p.value),
  );

  return {
    verdict,
    narrative:       "",
    roe:             m(r.roe),
    roce:            m(r.roce),
    roa:             m(r.roa),
    operatingMargin: m(f.operatingMargin),
    netMargin:       m(f.netMargin),
    chartData,
  };
}

// ---------------------------------------------------------------------------
// Peers
// ---------------------------------------------------------------------------

function buildPeers(raw: RawStockData): PeersTab {
  return {
    narrative: "",
    peers: raw.peers.map((p) => ({
      ticker:          p.ticker,
      name:            p.name,
      marketCapCrore:  m(p.marketCapCrore),
      peRatio:         m(p.peRatio),
      pbRatio:         m(p.pbRatio),
      roe:             m(p.roe),
      revenueGrowth3Y: m(p.revenueGrowth3Y),
      debtToEquity:    m(p.debtToEquity),
    })),
  };
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

function buildOwnership(raw: RawStockData): OwnershipTab {
  const { ownership: o } = raw;
  const declining = isPromoterDeclining(
    (o.trend ?? []).map((q) => ({ promoter: q.promoter })),
  );
  const verdict = scoreOwnership(o.promoterHolding, o.promoterPledge, declining);

  const trend = (o.trend ?? []).map((q) => ({
    quarter:  q.quarter,
    promoter: m(q.promoter),
    fii:      m(q.fii),
    dii:      m(q.dii),
  }));

  return {
    verdict,
    narrative:       "",
    promoterHolding: m(o.promoterHolding),
    promoterPledge:  m(o.promoterPledge),
    fiiHolding:      m(o.fiiHolding),
    diiHolding:      m(o.diiHolding),
    publicHolding:   m(o.publicHolding),
    trend,
  };
}

// ---------------------------------------------------------------------------
// The View — overall quality + data confidence (narratives filled later)
// ---------------------------------------------------------------------------

function deriveOverallQuality(
  valVerdict:  string,
  growVerdict: string,
  hlthVerdict: string,
  retVerdict:  string,
): OverallQuality {
  const score = (v: string) => {
    if (["Cheap", "Strong", "Excellent", "High Conviction"].includes(v)) return 2;
    if (["Fair", "Moderate", "Good", "Adequate", "Mixed"].includes(v))   return 1;
    if (["Expensive", "Weak", "Average", "Stretched"].includes(v))       return 0;
    if (["Declining", "Poor", "Distressed", "Concerning"].includes(v))  return -1;
    return 0; // Cannot Rate
  };

  const total = score(valVerdict) + score(growVerdict) + score(hlthVerdict) + score(retVerdict);

  if (total >= 6)  return "High";
  if (total >= 2)  return "Medium";
  if (total >= -1) return "Low";
  return "Cannot Rate";
}

function deriveDataConfidence(raw: RawStockData): DataConfidence {
  const checks = [
    raw.currentPrice,
    raw.marketCapCrore,
    raw.valuation.peRatio,
    raw.valuation.pbRatio,
    raw.financials.revenueGrowth3Y,
    raw.financials.profitGrowth3Y,
    raw.balanceSheet.debtToEquity,
    raw.returns.roe,
    raw.returns.roce,
    raw.ownership.promoterHolding,
  ];
  const available = checks.filter((v) => v != null).length;
  const ratio = available / checks.length;
  if (ratio >= 0.8) return "High";
  if (ratio >= 0.5) return "Medium";
  return "Low";
}

function buildTheView(
  valVerdict:  string,
  growVerdict: string,
  hlthVerdict: string,
  retVerdict:  string,
  raw:         RawStockData,
): TheViewTab {
  return {
    overallQuality:  deriveOverallQuality(valVerdict, growVerdict, hlthVerdict, retVerdict),
    dataConfidence:  deriveDataConfidence(raw),
    strengths:       [],           // filled by narrative generator
    watchPoints:     [],           // filled by narrative generator
    oneThingToTrack: "",           // filled by narrative generator
    disclaimer:      DISCLAIMER,   // hardcoded — never AI-generated
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function computeReport(raw: RawStockData): DeepDiveReport {
  const snapshot  = buildSnapshot(raw);
  const valuation = buildValuation(raw);
  const growth    = buildGrowth(raw);
  const health    = buildHealth(raw);
  const returns   = buildReturns(raw);
  const peers     = buildPeers(raw);
  const ownership = buildOwnership(raw);
  const theView   = buildTheView(
    valuation.verdict, growth.verdict, health.verdict, returns.verdict, raw,
  );

  return {
    ticker:      raw.ticker,
    exchange:    raw.exchange,
    generatedAt: new Date().toISOString(),
    dataAsOf:    raw.dataAsOf,
    sources:     [{ name: "DataProvider", fetchedAt: raw.fetchedAt }],
    snapshot,
    valuation,
    growth,
    health,
    returns,
    peers,
    ownership,
    theView,
  };
}
