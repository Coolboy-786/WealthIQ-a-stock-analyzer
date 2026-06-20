/**
 * Fetches all active mutual fund schemes from mfapi.in (AMFI data),
 * filters to Direct Growth plans only, and writes mf-schemes.json.
 *
 * Run: node scripts/fetch-mf-schemes.mjs
 *
 * Output shape per entry:
 *   { schemeCode, name, fundHouse, category }
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH   = path.join(__dirname, "../src/data/mf-schemes.json");
const MFAPI_URL  = "https://api.mfapi.in/mf";

// Known AMC prefixes — order matters (longer names first to avoid partial matches)
const KNOWN_AMCS = [
  "Aditya Birla Sun Life", "Axis", "Bandhan", "Bank of India",
  "Baroda BNP Paribas", "Canara Robeco", "DSP", "Edelweiss",
  "Franklin India", "Franklin Templeton", "HDFC", "HSBC",
  "ICICI Prudential", "Invesco India", "ITI", "JM Financial",
  "Kotak Mahindra", "Kotak", "LIC", "Mahindra Manulife",
  "Mirae Asset", "Motilal Oswal", "Navi", "Nippon India", "NJ",
  "PGIM India", "PPFAS", "Parag Parikh", "Quantum", "Quant",
  "SBI", "Samco", "Shriram", "Sundaram", "Tata", "Taurus",
  "Trust Mutual Fund", "Trust", "Union", "UTI",
  "WhiteOak Capital", "Zerodha",
];

function extractFundHouse(schemeName) {
  // Sort longest match first to avoid "Kotak" matching "Kotak Mahindra"
  const sorted = [...KNOWN_AMCS].sort((a, b) => b.length - a.length);
  for (const amc of sorted) {
    if (schemeName.toLowerCase().startsWith(amc.toLowerCase())) return amc;
  }
  // Fallback: everything before first " - "
  const idx = schemeName.indexOf(" - ");
  return idx > -1 ? schemeName.slice(0, idx) : schemeName.split(" ").slice(0, 2).join(" ");
}

function extractCategory(name) {
  const n = name.toLowerCase();
  if (/elss|tax\s*saver/.test(n))                          return "ELSS";
  if (/liquid|overnight/.test(n))                          return "Liquid";
  if (/ultra\s*short|ultra short/.test(n))                 return "Ultra Short Duration";
  if (/low\s*duration/.test(n))                            return "Low Duration";
  if (/short\s*duration/.test(n))                          return "Short Duration";
  if (/medium\s*duration|medium\s*term/.test(n))           return "Medium Duration";
  if (/long\s*duration/.test(n))                           return "Long Duration";
  if (/gilt/.test(n))                                      return "Gilt";
  if (/credit\s*risk/.test(n))                             return "Credit Risk";
  if (/corporate\s*bond/.test(n))                          return "Corporate Bond";
  if (/banking\s*&\s*psu|banking and psu/.test(n))         return "Banking & PSU";
  if (/dynamic\s*bond/.test(n))                            return "Dynamic Bond";
  if (/money\s*market/.test(n))                            return "Money Market";
  if (/floater/.test(n))                                   return "Floater";
  if (/debt|income|bond/.test(n))                          return "Debt";
  if (/large\s*&\s*mid|large and mid/.test(n))             return "Large & Mid Cap";
  if (/large\s*cap|bluechip|blue\s*chip/.test(n))          return "Large Cap";
  if (/mid\s*cap/.test(n))                                 return "Mid Cap";
  if (/small\s*cap/.test(n))                               return "Small Cap";
  if (/micro\s*cap/.test(n))                               return "Micro Cap";
  if (/flexi\s*cap/.test(n))                               return "Flexi Cap";
  if (/multi\s*cap/.test(n))                               return "Multi Cap";
  if (/focused/.test(n))                                   return "Focused";
  if (/value|contra/.test(n))                              return "Value / Contra";
  if (/dividend\s*yield/.test(n))                          return "Dividend Yield";
  if (/thematic|sectoral|sector/.test(n))                  return "Thematic / Sectoral";
  if (/international|us\s*equity|global|nasdaq|s&p|world/.test(n)) return "International";
  if (/silver/.test(n))                                    return "Silver";
  if (/gold/.test(n))                                      return "Gold";
  if (/copper|aluminium|aluminum|zinc|lead|nickel|metal/.test(n)) return "Metals";
  if (/commodity|commodit/.test(n))                        return "Commodity";
  if (/real\s*estate|reit/.test(n))                        return "Real Estate";
  if (/index|nifty|sensex|bse/.test(n))                    return "Index";
  if (/aggressive\s*hybrid/.test(n))                       return "Aggressive Hybrid";
  if (/conservative\s*hybrid/.test(n))                     return "Conservative Hybrid";
  if (/balanced\s*advantage|dynamic\s*asset/.test(n))      return "Balanced Advantage";
  if (/multi\s*asset/.test(n))                             return "Multi Asset";
  if (/equity\s*savings/.test(n))                          return "Equity Savings";
  if (/arbitrage/.test(n))                                 return "Arbitrage";
  if (/hybrid/.test(n))                                    return "Hybrid";
  if (/equity/.test(n))                                    return "Equity";
  return "Other";
}

function cleanName(schemeName) {
  return schemeName
    .replace(/\s*-\s*(direct\s*plan|direct)\s*-\s*(growth|idcw|dividend|bonus|reinvestment).*/i, " - Direct Growth")
    .replace(/\s*-\s*direct\s*-\s*(growth|idcw).*/i, " - Direct Growth")
    .replace(/\s*direct\s*plan\s*growth\s*/i, " - Direct Growth")
    .trim();
}

async function main() {
  console.log("Fetching MF scheme list from mfapi.in…");
  const res = await fetch(MFAPI_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (WealthIQ MF fetcher)" },
  });
  if (!res.ok) throw new Error(`mfapi.in fetch failed: ${res.status}`);

  const all = await res.json();
  console.log(`Total schemes from AMFI: ${all.length}`);

  const schemes = [];
  for (const { schemeCode, schemeName } of all) {
    const n = schemeName.toLowerCase();

    const isEtfScheme = /\betf\b/i.test(schemeName);

    if (isEtfScheme) {
      // ETFs have no direct/regular split — exclude only dividend/IDCW variants
      if (/dividend|idcw|payout/i.test(schemeName)) continue;
    } else {
      // Regular MFs: keep only Direct + Growth
      if (!n.includes("direct")) continue;
      if (!n.includes("growth"))  continue;
    }

    // Skip fund of funds
    if (n.includes("fof") || n.includes("fund of fund")) continue;

    // Skip discontinued/segregated
    if (n.includes("segregated") || n.includes("discontinued")) continue;

    const name      = cleanName(schemeName);
    const fundHouse = extractFundHouse(schemeName);
    const category  = extractCategory(schemeName);

    schemes.push({ schemeCode, name, fundHouse, category, ...(isEtfScheme && { isEtf: true }) });
  }

  schemes.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(OUT_PATH, JSON.stringify(schemes, null, 2));
  console.log(`Written ${schemes.length} Direct Growth MF schemes to mf-schemes.json`);

  // Stats by category
  const byCategory = schemes.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  console.log("\nTop categories:");
  sorted.slice(0, 10).forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
