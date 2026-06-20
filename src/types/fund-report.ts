import type { Metric } from "./report";

export interface NavPoint {
  date: string;
  nav:  number;
}

export type PeriodKey = "1d" | "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y";

export interface NavHistories {
  "1m": NavPoint[];
  "3m": NavPoint[];
  "6m": NavPoint[];
  "1y": NavPoint[];
  "3y": NavPoint[];
  "5y": NavPoint[];
}

export interface FundReport {
  schemeCode:    number;
  name:          string;
  fundHouse:     string;
  category:      string;
  isEtf:         boolean;
  dataAsOf:      string;
  inceptionDate: string;
  currentNav:    number;

  // Returns
  ret1m:        Metric<number>;
  ret3m:        Metric<number>;
  ret6m:        Metric<number>;
  ret1y:        Metric<number>;
  ret3yCagr:    Metric<number>;
  ret5yCagr:    Metric<number>;
  ret10yCagr:   Metric<number>;
  retAllTime:   Metric<number>;
  allTimeYears: number;

  // Risk
  volatility:  Metric<number>;
  maxDrawdown: Metric<number>;
  sharpeRatio: Metric<number>;

  navHistories: NavHistories;
  disclaimer:   string;
}
