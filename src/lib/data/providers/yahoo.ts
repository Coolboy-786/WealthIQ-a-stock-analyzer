// yahoo-finance2 v3: default export is the class, must instantiate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceClass from "yahoo-finance2";
import type { DataProvider, RawStockData } from "@/types/provider";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey"] }) as any;

function toYahooTicker(ticker: string, exchange: "NSE" | "BSE"): string {
  return exchange === "NSE" ? `${ticker}.NS` : `${ticker}.BO`;
}

function quarterLabel(date: Date): string {
  const m  = date.getMonth();
  const yr = date.getFullYear();
  const fy = m >= 3 ? yr + 1 : yr;
  const q  = m >= 3 ? Math.floor((m - 3) / 3) + 1 : 4;
  return `Q${q} FY${String(fy).slice(2)}`;
}

function n(v: unknown): number | undefined {
  return typeof v === "number" && isFinite(v) ? v : undefined;
}

export const yahooProvider: DataProvider = {
  name: "yahoo-finance2",

  async fetch(ticker, exchange) {
    const symbol = toYahooTicker(ticker, exchange);

    const [qRes, sRes] = await Promise.allSettled([
      yf.quote(symbol, {}, { validateResult: false }),
      yf.quoteSummary(symbol, {
        modules: ["assetProfile", "financialData", "defaultKeyStatistics", "majorHoldersBreakdown"],
      }, { validateResult: false }),
    ]);

    // v3 returns direct numbers, NOT { raw, fmt } objects
    const q  = qRes.status  === "fulfilled" ? qRes.value  : null;
    const s  = sRes.status  === "fulfilled" ? sRes.value  : null;

    const fd = (s as any)?.financialData        ?? {};
    const ks = (s as any)?.defaultKeyStatistics ?? {};
    const ap = (s as any)?.assetProfile         ?? {};
    const mh = (s as any)?.majorHoldersBreakdown ?? {};

    const now = new Date();

    // Debt-to-equity in Yahoo financialData is expressed as % (e.g. 118 = 1.18x) — divide by 100
    const d2e = n(fd.debtToEquity) != null ? n(fd.debtToEquity)! / 100 : undefined;

    return {
      ticker,
      exchange,
      companyName:       (q as any)?.longName ?? (q as any)?.shortName ?? ticker,
      sector:            ap.sector   ?? "Unknown",
      industry:          ap.industry ?? "Unknown",
      description:       (ap.longBusinessSummary as string | undefined)?.slice(0, 500) ?? "",
      marketCapCrore:    n((q as any)?.marketCap)   != null ? n((q as any).marketCap)!   / 1e7 : undefined,
      currentPrice:      n((q as any)?.regularMarketPrice),
      fiftyTwoWeekHigh:  n((q as any)?.fiftyTwoWeekHigh),
      fiftyTwoWeekLow:   n((q as any)?.fiftyTwoWeekLow),
      dataAsOf:          quarterLabel(now),
      fetchedAt:         now.toISOString(),

      financials: {
        // 3Y CAGR unavailable — Yahoo free tier dropped historical statements Nov 2024
        revenueGrowth3Y:  undefined,
        profitGrowth3Y:   undefined,
        epsGrowth3Y:      undefined,
        revenueGrowthTTM: n(fd.revenueGrowth)  != null ? n(fd.revenueGrowth)!  * 100 : undefined,
        profitGrowthTTM:  n(fd.earningsGrowth) != null ? n(fd.earningsGrowth)! * 100 : undefined,
        operatingMargin:  n(fd.operatingMargins) != null ? n(fd.operatingMargins)! * 100 : undefined,
        netMargin:        n(fd.profitMargins)    != null ? n(fd.profitMargins)!    * 100 : undefined,
        revenueCrore:     [],
        netProfitCrore:   [],
        epsList:          [],
        revenueLabels:    [],
      },

      balanceSheet: {
        debtToEquity:            d2e,
        currentRatio:            n(fd.currentRatio),
        cashAndEquivalentsCrore: n(fd.totalCash) != null ? n(fd.totalCash)! / 1e7 : undefined,
        interestCoverageRatio:   undefined,
      },

      cashFlow: {
        operatingCashFlowCrore: n(fd.operatingCashflow) != null ? n(fd.operatingCashflow)! / 1e7 : undefined,
        freeCashFlowCrore:      n(fd.freeCashflow)      != null ? n(fd.freeCashflow)!      / 1e7 : undefined,
      },

      valuation: {
        peRatio:       n((q as any)?.trailingPE),
        pbRatio:       n((q as any)?.priceToBook),
        evEbitda:      n(ks.enterpriseToEbitda),
        priceToSales:  n(ks.priceToSalesTrailing12Months),
        sectorMedianPE: undefined,
      },

      returns: {
        roe:  n(fd.returnOnEquity) != null ? n(fd.returnOnEquity)! * 100 : undefined,
        roa:  n(fd.returnOnAssets) != null ? n(fd.returnOnAssets)! * 100 : undefined,
        roce: undefined, // requires full balance sheet
      },

      ownership: {
        promoterHolding: n(mh?.insidersPercentHeld)    != null ? n(mh.insidersPercentHeld)!    * 100 : undefined,
        fiiHolding:      n(mh?.institutionsPercentHeld) != null ? n(mh.institutionsPercentHeld)! * 100 : undefined,
        diiHolding:      undefined,
        publicHolding:   undefined,
        promoterPledge:  undefined,
      },

      peers: [],
    } satisfies RawStockData;
  },
};
