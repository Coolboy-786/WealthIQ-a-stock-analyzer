/**
 * Fetches the complete NSE equity list from NSE's public CSV archive,
 * merges with manually enriched sector/industry data, and writes symbols.json.
 *
 * Run: node scripts/fetch-symbols.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SYMBOLS_PATH = path.join(__dirname, "../src/data/symbols.json");

const NSE_CSV_URL =
  "https://archives.nseindia.com/content/equities/EQUITY_L.csv";

function parseCSVLine(line) {
  const cols = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

async function main() {
  // Load existing symbols.json as the enrichment source (sector/industry)
  const existing = JSON.parse(fs.readFileSync(SYMBOLS_PATH, "utf-8"));
  const enriched = {};
  for (const s of existing) {
    enriched[s.ticker] = { sector: s.sector, industry: s.industry };
  }
  console.log(`Loaded ${existing.length} enriched entries from symbols.json`);

  console.log("Fetching NSE equity list…");
  const res = await fetch(NSE_CSV_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (WealthIQ symbol fetcher)" },
  });
  if (!res.ok) {
    throw new Error(`NSE CSV fetch failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  console.log(`Got ${lines.length} lines (including header)`);

  // Header: SYMBOL,NAME OF COMPANY,SERIES,DATE OF LISTING,PAID UP VALUE,MARKET LOT,ISIN NUMBER,FACE VALUE
  const symbols = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const ticker = cols[0];
    const name   = cols[1];
    const series = cols[2];

    if (!ticker || !name) continue;
    if (series !== "EQ") continue; // skip warrants, SME-ITP, etc.

    const enc = enriched[ticker];
    symbols.push({
      ticker,
      name: toTitleCase(name),
      exchange: "NSE",
      sector:   enc?.sector   ?? "Unknown",
      industry: enc?.industry ?? "Unknown",
    });
  }

  // Enriched stocks first, then Unknown alphabetically
  symbols.sort((a, b) => {
    const aK = a.sector !== "Unknown" ? 0 : 1;
    const bK = b.sector !== "Unknown" ? 0 : 1;
    if (aK !== bK) return aK - bK;
    return a.ticker.localeCompare(b.ticker);
  });

  fs.writeFileSync(SYMBOLS_PATH, JSON.stringify(symbols, null, 2));

  const enrichedCount = symbols.filter((s) => s.sector !== "Unknown").length;
  console.log(`Done. Total: ${symbols.length} | Enriched: ${enrichedCount} | Unknown sector: ${symbols.length - enrichedCount}`);
}

function toTitleCase(str) {
  // NSE names come in ALL CAPS — convert to Title Case
  return str
    .toLowerCase()
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .replace(/\b(Ltd|Pvt|Inc|Plc|Co|And|Of|The|For|A)\b/gi, (m) =>
      m.toLowerCase()
    )
    .replace(/\b(Ltd)\b/gi, "Ltd")
    .replace(/\b(Ltd\.)\b/gi, "Ltd.")
    .replace(/\b(NSE|BSE|ICICI|HDFC|SBI|NBFC|ITI|BEL|HAL|PSU|PSB)\b/gi, (m) =>
      m.toUpperCase()
    );
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
