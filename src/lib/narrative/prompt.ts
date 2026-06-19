import type { DeepDiveReport } from "@/types/report";
import { DISCLAIMER } from "@/lib/rules-engine/thresholds";

export { DISCLAIMER };

// ---------------------------------------------------------------------------
// Build the grounded prompt for a single tab's narrative.
// The AI receives ONLY the numbers already in the report — it cannot invent any.
// SKILL.md guardrails are injected as system instructions.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the analysis brain of WealthIQ, an Indian stock fundamentals research tool.

HARD RULES — violation is not permitted under any circumstances:
1. Never invent, estimate, or guess a number. Only use figures explicitly provided in the USER prompt.
2. Never use the words "buy", "sell", "hold", "recommend", "should buy", "looks like a buy", or any equivalent.
3. Never give a price target, fair value estimate, or upside/downside percentage.
4. Never make predictions. You may describe historical trends; never forecast them continuing.
5. If a figure is marked "unavailable", acknowledge the gap — do not work around it with estimates.
6. Write in plain English a smart beginner can follow. Explain jargon in one short clause the first time.
7. Be honest about uncertainty. "The data suggests" is fine; "This will" is not.
8. Every narrative must end with factual grounding — reference the numbers provided, not generalisations.

TONE: Direct, clear, conversational. Not a Bloomberg terminal. Not a CNBC anchor. A knowledgeable friend.
LENGTH: 3–5 sentences per tab narrative. Concise.`;

function metricStr(m: { available: boolean; value?: unknown }, unit = ""): string {
  if (!m.available) return "unavailable";
  return `${m.value}${unit}`;
}

export function buildNarrativePrompts(report: DeepDiveReport): Record<string, string> {
  const { snapshot, valuation, growth, health, returns, peers, ownership } = report;

  return {
    snapshot: `Write a 3-sentence "At a Glance" narrative for ${snapshot.companyName} (${snapshot.ticker}).

Company: ${snapshot.description}
Sector: ${snapshot.sector} / ${snapshot.industry}
Market cap: ${metricStr(snapshot.marketCapCrore, " Cr")} (${metricStr(snapshot.marketCapCategory)})
Current price: ₹${metricStr(snapshot.currentPrice)}
52W range: ₹${metricStr(snapshot.fiftyTwoWeekLow)} – ₹${metricStr(snapshot.fiftyTwoWeekHigh)}

Summarise what this company is and what makes it interesting or worth understanding. No advice.`,

    valuation: `Write a 3-4 sentence valuation narrative for ${snapshot.companyName}.

Valuation verdict: ${valuation.verdict}
P/E: ${metricStr(valuation.peRatio)}x (sector median: ${metricStr(valuation.sectorMedianPE)}x)
P/B: ${metricStr(valuation.pbRatio)}x
EV/EBITDA: ${metricStr(valuation.evEbitda)}x
Price/Sales: ${metricStr(valuation.priceToSales)}x

Explain what the verdict means in plain English, using only the numbers above.
Do NOT give a target price, price range, or buy/sell signal.`,

    growth: `Write a 3-4 sentence growth narrative for ${snapshot.companyName}.

Growth verdict: ${growth.verdict}
Revenue CAGR 3Y: ${metricStr(growth.revenueGrowth3Y, "%")}
Profit CAGR 3Y: ${metricStr(growth.profitGrowth3Y, "%")}
EPS CAGR 3Y: ${metricStr(growth.epsGrowth3Y, "%")}
Revenue growth TTM: ${metricStr(growth.revenueGrowthTTM, "%")}
Profit growth TTM: ${metricStr(growth.profitGrowthTTM, "%")}

Describe whether growth is accelerating, steady, slowing, or declining and what drives it.
No predictions about future growth.`,

    health: `Write a 3-4 sentence financial health narrative for ${snapshot.companyName}.

Health verdict: ${health.verdict}
Debt/Equity: ${metricStr(health.debtToEquity)}
Interest coverage: ${metricStr(health.interestCoverageRatio)}x
Current ratio: ${metricStr(health.currentRatio)}
Cash & equivalents: ₹${metricStr(health.cashAndEquivalentsCrore, " Cr")}
Operating cash flow: ₹${metricStr(health.operatingCashFlowCrore, " Cr")}
Free cash flow: ₹${metricStr(health.freeCashFlowCrore, " Cr")}

Explain what the balance sheet and cash position tell us about financial safety.
If FCF is negative, note this honestly.`,

    returns: `Write a 3-4 sentence returns narrative for ${snapshot.companyName}.

Returns verdict: ${returns.verdict}
ROE: ${metricStr(returns.roe, "%")}
ROCE: ${metricStr(returns.roce, "%")}
ROA: ${metricStr(returns.roa, "%")}
Operating margin: ${metricStr(returns.operatingMargin, "%")}
Net margin: ${metricStr(returns.netMargin, "%")}

Explain in plain English what these numbers say about how efficiently the company uses capital.
ROE = Return on Equity (profit relative to shareholders' money); ROCE = Return on Capital Employed.`,

    peers: `Write a 2-3 sentence peer comparison narrative for ${snapshot.companyName} vs its listed peers.

Sector: ${snapshot.sector}
Peers: ${peers.peers.map((p) => `${p.name} (PE ${metricStr(p.peRatio)}x, ROE ${metricStr(p.roe, "%")}, D/E ${metricStr(p.debtToEquity)})`).join(" | ")}

Describe how this company compares to peers without naming a winner or making a recommendation.`,

    ownership: `Write a 3-4 sentence ownership narrative for ${snapshot.companyName}.

Ownership verdict: ${ownership.verdict}
Promoter holding: ${metricStr(ownership.promoterHolding, "%")}
Promoter pledge: ${metricStr(ownership.promoterPledge, "%")}
FII holding: ${metricStr(ownership.fiiHolding, "%")}
DII holding: ${metricStr(ownership.diiHolding, "%")}

Explain what this ownership structure signals about confidence and any risks.
If pledge > 10%, flag it plainly.`,

    theView: `Write the summary section for ${snapshot.companyName}'s deep dive. Output ONLY valid JSON matching this exact shape:
{
  "strengths": ["...", "...", "..."],
  "watchPoints": ["...", "...", "..."],
  "oneThingToTrack": "..."
}

Context (use ONLY these facts):
- Valuation: ${valuation.verdict} (PE ${metricStr(valuation.peRatio)}x vs sector ${metricStr(valuation.sectorMedianPE)}x)
- Growth: ${growth.verdict} (revenue CAGR 3Y ${metricStr(growth.revenueGrowth3Y, "%")})
- Health: ${health.verdict} (D/E ${metricStr(health.debtToEquity)}, coverage ${metricStr(health.interestCoverageRatio)}x)
- Returns: ${returns.verdict} (ROE ${metricStr(returns.roe, "%")}, ROCE ${metricStr(returns.roce, "%")})
- Ownership: ${ownership.verdict} (promoter ${metricStr(ownership.promoterHolding, "%")}, pledge ${metricStr(ownership.promoterPledge, "%")})

Rules: 3 strengths, 2-3 watch points, each backed by a specific figure from above.
oneThingToTrack: one concrete metric or event to monitor — specific, not generic.
No buy/sell/hold language. No predictions. No fabricated numbers.`,
  };
}

export const NARRATIVE_SYSTEM_PROMPT = SYSTEM_PROMPT;
