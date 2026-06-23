import type { FundReport, NavPoint, NavHistories } from "@/types/fund-report";
import type { Metric } from "@/types/report";
import { DISCLAIMER } from "@/lib/rules-engine/thresholds";

const MFAPI_BASE = "https://api.mfapi.in/mf";
const RISK_FREE  = 6.5;

interface RawNavEntry { date: string; nav: string }
interface MFAPIMeta {
  fund_house: string; scheme_type: string; scheme_category: string;
  scheme_code: number; scheme_name: string;
}
interface MFAPIResponse { meta: MFAPIMeta; data: RawNavEntry[]; status: string }
interface ParsedNav { date: Date; nav: number }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function parseNavDate(s: string): Date {
  const [d, m, y] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function met<T>(value: T): Metric<T> { return { available: true, value }; }
const NA: Metric<number> = { available: false };

function daysAgo(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
function monthsAgo(n: number): Date {
  const d = new Date(); d.setMonth(d.getMonth() - n); return d;
}
function yearsAgo(n: number): Date {
  const d = new Date(); d.setFullYear(d.getFullYear() - n); return d;
}

function findNavBefore(sorted: ParsedNav[], target: Date): number | null {
  let result: number | null = null;
  for (const p of sorted) {
    if (p.date <= target) result = p.nav; else break;
  }
  return result;
}

function simpleReturn(start: number, end: number) { return ((end - start) / start) * 100; }
function cagrFn(start: number, end: number, years: number) { return ((end / start) ** (1 / years) - 1) * 100; }

function retMetric(sorted: ParsedNav[], daysBack: number, useCAGR: boolean): Metric<number> {
  const latest = sorted[sorted.length - 1];
  if (!latest) return NA;
  const pastNav = findNavBefore(sorted, daysAgo(daysBack));
  if (!pastNav) return NA;
  const years = daysBack / 365;
  const pct   = useCAGR ? cagrFn(pastNav, latest.nav, years) : simpleReturn(pastNav, latest.nav);
  return met(parseFloat(pct.toFixed(2)));
}

function computeVolatility(sorted: ParsedNav[], days = 365): Metric<number> {
  const window = sorted.filter((p) => p.date >= daysAgo(days));
  if (window.length < 30) return NA;
  const logs = [];
  for (let i = 1; i < window.length; i++) logs.push(Math.log(window[i].nav / window[i-1].nav));
  const mean = logs.reduce((a, b) => a + b, 0) / logs.length;
  const variance = logs.reduce((a, b) => a + (b - mean) ** 2, 0) / logs.length;
  return met(parseFloat((Math.sqrt(variance * 252) * 100).toFixed(2)));
}

function computeMaxDrawdown(sorted: ParsedNav[]): Metric<number> {
  if (sorted.length < 10) return NA;
  let peak = sorted[0].nav; let maxDD = 0;
  for (const p of sorted) {
    if (p.nav > peak) peak = p.nav;
    const dd = ((peak - p.nav) / peak) * 100;
    if (dd > maxDD) maxDD = dd;
  }
  return met(parseFloat(maxDD.toFixed(2)));
}

function computeSharpe(ret1y: Metric<number>, vol: Metric<number>): Metric<number> {
  if (!ret1y.available || !vol.available || vol.value === 0) return NA;
  return met(parseFloat(((ret1y.value - RISK_FREE) / vol.value).toFixed(2)));
}

function fmtDay(d: Date)   { return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`; }
function fmtMonth(d: Date) { return `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`; }
function fmtDisplayDate(d: Date) {
  return `${String(d.getDate()).padStart(2,"0")} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function buildSeries(
  sorted: ParsedNav[],
  cutoff: Date,
  granularity: "daily" | "weekly" | "monthly",
): NavPoint[] {
  const window = sorted.filter((p) => p.date >= cutoff);
  const seen   = new Set<string>();
  const points: NavPoint[] = [];

  for (const p of window) {
    let key: string;
    let label: string;

    if (granularity === "daily") {
      key   = p.date.toISOString().slice(0, 10);
      label = fmtDay(p.date);
    } else if (granularity === "weekly") {
      // bucket by ISO week (year + week number)
      const weekMs   = 7 * 24 * 60 * 60 * 1000;
      const weekNum  = Math.floor(p.date.getTime() / weekMs);
      key   = String(weekNum);
      label = fmtMonth(p.date);
    } else {
      key   = `${p.date.getFullYear()}-${p.date.getMonth()}`;
      label = fmtMonth(p.date);
    }

    if (!seen.has(key)) {
      seen.add(key);
      points.push({ date: label, nav: p.nav });
    }
  }
  return points;
}

function buildHistories(sorted: ParsedNav[]): NavHistories {
  return {
    "1m": buildSeries(sorted, monthsAgo(1),  "daily"),
    "3m": buildSeries(sorted, monthsAgo(3),  "daily"),
    "6m": buildSeries(sorted, monthsAgo(6),  "weekly"),
    "1y": buildSeries(sorted, yearsAgo(1),   "weekly"),
    "3y": buildSeries(sorted, yearsAgo(3),   "monthly"),
    "5y": buildSeries(sorted, yearsAgo(5),   "monthly"),
  };
}

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        signal: controller.signal,
        cache:  "no-store",
      });
      clearTimeout(timer);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function fetchFundReport(
  schemeCode: number,
  meta: { name: string; fundHouse: string; category: string; isEtf: boolean },
): Promise<FundReport> {
  const res = await fetchWithRetry(`${MFAPI_BASE}/${schemeCode}`);
  if (!res.ok) throw new Error(`mfapi.in ${schemeCode}: HTTP ${res.status}`);

  const raw: MFAPIResponse = await res.json();
  if (raw.status !== "SUCCESS" || raw.data.length === 0)
    throw new Error(`mfapi.in no data for ${schemeCode}`);

  const sorted: ParsedNav[] = raw.data
    .map((d) => ({ date: parseNavDate(d.date), nav: parseFloat(d.nav) }))
    .filter((p) => !isNaN(p.nav))
    .reverse();

  const latest          = sorted[sorted.length - 1];
  const oldest          = sorted[0];
  const allTimeYearsRaw = (latest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const allTimeYears    = parseFloat(allTimeYearsRaw.toFixed(1));

  const ret1y = retMetric(sorted, 365, false);
  const vol   = computeVolatility(sorted, 365);

  return {
    schemeCode:    raw.meta.scheme_code,
    name:          meta.name,
    fundHouse:     meta.fundHouse,
    category:      meta.category,
    isEtf:         meta.isEtf,
    dataAsOf:      fmtDisplayDate(latest.date),
    inceptionDate: fmtDisplayDate(oldest.date),
    currentNav:    parseFloat(latest.nav.toFixed(4)),

    ret1m:      retMetric(sorted, 30,   false),
    ret3m:      retMetric(sorted, 90,   false),
    ret6m:      retMetric(sorted, 180,  false),
    ret1y,
    ret3yCagr:  retMetric(sorted, 1095, true),
    ret5yCagr:  retMetric(sorted, 1825, true),
    ret10yCagr: retMetric(sorted, 3650, true),
    retAllTime: allTimeYears > 0.5
      ? met(parseFloat(cagrFn(oldest.nav, latest.nav, allTimeYears).toFixed(2)))
      : NA,
    allTimeYears,

    volatility:  vol,
    maxDrawdown: computeMaxDrawdown(sorted),
    sharpeRatio: computeSharpe(ret1y, vol),

    navHistories: buildHistories(sorted),
    disclaimer:   DISCLAIMER,
  };
}
