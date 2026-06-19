import type { DeepDiveReport } from "./report";

// ---------------------------------------------------------------------------
// Raw data shape returned by any DataProvider implementation.
// Fields are optional because providers vary in coverage.
// Rules engine maps RawStockData → scored tabs.
// ---------------------------------------------------------------------------
export interface RawFinancials {
  revenueCrore?:          number[];   // annual, newest first
  netProfitCrore?:        number[];
  epsList?:               number[];
  revenueGrowth3Y?:       number;     // CAGR %
  profitGrowth3Y?:        number;
  epsGrowth3Y?:           number;
  revenueGrowthTTM?:      number;
  profitGrowthTTM?:       number;
  operatingMargin?:       number;
  netMargin?:             number;
  revenueLabels?:         string[];   // ["FY21","FY22",...] aligned with revenueCrore
}

export interface RawBalanceSheet {
  debtToEquity?:              number;
  currentRatio?:              number;
  cashAndEquivalentsCrore?:   number;
  interestCoverageRatio?:     number;
  debtToEquityHistory?:       { label: string; value: number }[];
}

export interface RawCashFlow {
  operatingCashFlowCrore?: number;
  freeCashFlowCrore?:      number;
}

export interface RawValuation {
  peRatio?:       number;
  pbRatio?:       number;
  evEbitda?:      number;
  priceToSales?:  number;
  sectorMedianPE?: number;
  peHistory?:     { label: string; value: number }[];
}

export interface RawReturns {
  roe?:      number;
  roce?:     number;
  roa?:      number;
  roeHistory?: { label: string; value: number }[];
}

export interface RawOwnership {
  promoterHolding?: number;
  promoterPledge?:  number;
  fiiHolding?:      number;
  diiHolding?:      number;
  publicHolding?:   number;
  trend?:           { quarter: string; promoter?: number; fii?: number; dii?: number }[];
}

export interface RawPeer {
  ticker:           string;
  name:             string;
  marketCapCrore?:  number;
  peRatio?:         number;
  pbRatio?:         number;
  roe?:             number;
  revenueGrowth3Y?: number;
  debtToEquity?:    number;
}

export interface RawStockData {
  ticker:             string;
  exchange:           "NSE" | "BSE";
  companyName:        string;
  sector:             string;
  industry:           string;
  description:        string;
  marketCapCrore?:    number;
  currentPrice?:      number;
  fiftyTwoWeekHigh?:  number;
  fiftyTwoWeekLow?:   number;
  dataAsOf:           string;   // "Q3 FY25"
  fetchedAt:          string;   // ISO-8601
  financials:         RawFinancials;
  balanceSheet:       RawBalanceSheet;
  cashFlow:           RawCashFlow;
  valuation:          RawValuation;
  returns:            RawReturns;
  ownership:          RawOwnership;
  peers:              RawPeer[];
}

// ---------------------------------------------------------------------------
// DataProvider interface — swap implementations without touching UI
// ---------------------------------------------------------------------------
export interface DataProvider {
  name:    string;
  fetch:   (ticker: string, exchange: "NSE" | "BSE") => Promise<RawStockData>;
}

// ---------------------------------------------------------------------------
// Cache layer interface
// ---------------------------------------------------------------------------
export interface ReportCache {
  get:  (key: string) => Promise<DeepDiveReport | null>;
  set:  (key: string, report: DeepDiveReport, ttlSeconds?: number) => Promise<void>;
}
