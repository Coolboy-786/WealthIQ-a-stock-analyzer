# WealthIQ — Project Brief & Conventions

## What this is
AI-powered fundamentals research companion for Indian (NSE/BSE) stocks.
User types a stock → gets an interactive plain-English "deep dive" of the company's fundamentals.
Personal project initially; will go public/shareable later.

## Core philosophy
- **No buy/sell/hold calls. No price targets. No forecasts. Ever.**
- Educational only. Disclaimer on every report.
- Plain English a beginner can follow.
- Radical honesty: missing data → "data unavailable" flag. Never render a number that didn't come from the data provider.
- Every report shows data-confidence level + source attribution.
- Fast, focused UX: one search → one excellent report.

## Analysis methodology
`SKILL.md` (to be committed) is the source of truth for:
- 8-tab deep-dive structure
- Verdict thresholds (Cheap/Fair/Expensive, debt bands, growth labels, return-on-capital bands)
- Hard guardrails (no targets/predictions, flag missing data, always show disclaimer)

Deterministic parts (thresholds) → typed `rules-engine` module.
Narrative prose → Anthropic API, grounded ONLY in fetched numbers + rules-engine verdicts.
The AI must NEVER invent a number.

## Tech stack
- Next.js 16 App Router + TypeScript on Vercel
- Tailwind CSS v4
- Search: static `symbols.json` + client-side Fuse.js fuzzy search
- Cache: Supabase (Postgres) or Upstash Redis, keyed by `ticker:quarter`
- Rules engine: typed TS module in `src/lib/rules-engine/`
- Narrative: Anthropic API with strict grounded prompt
- Data (current): `yahoo-finance2` (free, prototype-only — ToS-gray, not for production)
- Data (production): paid fundamentals API (FinEdge / RapidAPI Indian Stock Exchange)
- Refresh: Vercel Cron / GitHub Action (prices daily, fundamentals post-results)

## Data layer contract
ALL data access behind `DataProvider` interface (`src/lib/data/provider.ts`).
Swapping data source = swapping the provider implementation only.

## The deep-dive artifact
8 tabs: Snapshot · Valuation · Growth · Health · Returns · Peers · Ownership · The View

Rendered as: `<DeepDive data={DeepDiveReport} />`
Adding a stock = supplying one `DeepDiveReport` JSON object.

Every data point is `Metric<T>`:
```ts
type Metric<T = number> =
  | { available: true; value: T }
  | { available: false };
```
Absence is declared, never silent. No defaulting to 0 or null.

`theView.disclaimer` is a hardcoded string — never AI-generated.

## Build stages
- **Stage 0 (current):** Scaffold + types + search + report template + 3 seed JSON reports. Clickable end-to-end UX with no live data.
- **Stage 1:** DataProvider (yahoo-finance2) + rules engine + cached Claude narrative.
- **Stage 2:** Full NSE universe, autocomplete, refresh jobs, error/empty states.
- **Stage 3:** Analytics, rate limiting, optional accounts/watchlists, monitoring.

## Repo structure
```
src/
  app/                        # Next.js App Router
    layout.tsx
    page.tsx                  # home + search
    stock/[ticker]/page.tsx   # deep dive page
    api/report/[ticker]/route.ts
  components/
    search/
      SearchBar.tsx
      SearchResults.tsx
    deep-dive/
      DeepDive.tsx            # root: <DeepDive data={report} />
      tabs/                   # one file per tab
      VerdictBadge.tsx
      StatCard.tsx
      MiniChart.tsx
      DataUnavailable.tsx
  lib/
    rules-engine/             # thresholds.ts + per-dimension modules
    data/
      provider.ts             # DataProvider interface
      providers/yahoo.ts
      cache.ts
    narrative/
      generate.ts             # Anthropic API call
      prompt.ts               # grounded prompt builder
    search/fuse.ts
  types/
    report.ts                 # DeepDiveReport + tab types
    provider.ts               # DataProvider + raw types
    verdicts.ts               # verdict union types
  data/
    symbols.json              # NSE/BSE ticker list
    seed/                     # hand-crafted JSON reports
scripts/
  refresh-prices.ts
  refresh-fundamentals.ts
supabase/migrations/
```

## Conventions
- TypeScript strict mode. No `any`.
- All data points use `Metric<T>` — never raw `number | null`.
- Verdict types are union string literals, not enums.
- No comments unless WHY is non-obvious.
- No buy/sell/hold language anywhere in code, prompts, or UI copy.
- `DISCLAIMER` constant lives in `src/lib/narrative/prompt.ts` — import it, don't rewrite it.
- Data provider selected via `DATA_PROVIDER` env var: `"yahoo"` | `"finedge"`.

## Key guardrails checklist (enforce in every PR)
- [ ] No price targets rendered anywhere
- [ ] No "buy" / "sell" / "hold" / "recommend" in any string
- [ ] Every number in a report traces back to a `Metric<T>` field from the provider
- [ ] Missing data renders `<DataUnavailable />`, never `0` or `N/A`
- [ ] `theView.disclaimer` is the hardcoded constant, not AI text
- [ ] Data confidence + source shown on every report
