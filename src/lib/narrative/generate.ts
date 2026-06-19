import Groq from "groq-sdk";
import type { DeepDiveReport } from "@/types/report";
import { buildNarrativePrompts, NARRATIVE_SYSTEM_PROMPT, DISCLAIMER } from "./prompt";

export interface NarrativeResult {
  snapshot:        string;
  valuation:       string;
  growth:          string;
  health:          string;
  returns:         string;
  peers:           string;
  ownership:       string;
  strengths:       string[];
  watchPoints:     string[];
  oneThingToTrack: string;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(userPrompt: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
      { role: "user",   content: userPrompt },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateNarratives(
  report: DeepDiveReport,
): Promise<NarrativeResult> {
  const prompts = buildNarrativePrompts(report);

  // Fire all tab narratives in parallel; theView is last (depends on others contextually)
  const [snapshot, valuation, growth, health, returns, peers, ownership, theViewRaw] =
    await Promise.all([
      callGroq(prompts.snapshot),
      callGroq(prompts.valuation),
      callGroq(prompts.growth),
      callGroq(prompts.health),
      callGroq(prompts.returns),
      callGroq(prompts.peers),
      callGroq(prompts.ownership),
      callGroq(prompts.theView),
    ]);

  // theView returns JSON — parse safely
  let strengths:       string[] = [];
  let watchPoints:     string[] = [];
  let oneThingToTrack: string   = "";

  try {
    const json = JSON.parse(theViewRaw.replace(/^```json\s*|```\s*$/g, "").trim());
    strengths       = Array.isArray(json.strengths)   ? json.strengths   : [];
    watchPoints     = Array.isArray(json.watchPoints) ? json.watchPoints : [];
    oneThingToTrack = typeof json.oneThingToTrack === "string" ? json.oneThingToTrack : "";
  } catch {
    // graceful degradation — TheView will show seed/empty state
  }

  return {
    snapshot, valuation, growth, health, returns, peers, ownership,
    strengths, watchPoints, oneThingToTrack,
  };
}

export function mergeNarratives(
  report:     DeepDiveReport,
  narratives: NarrativeResult,
): DeepDiveReport {
  return {
    ...report,
    snapshot:  { ...report.snapshot,  narrative: narratives.snapshot  || report.snapshot.narrative  },
    valuation: { ...report.valuation, narrative: narratives.valuation || report.valuation.narrative },
    growth:    { ...report.growth,    narrative: narratives.growth    || report.growth.narrative    },
    health:    { ...report.health,    narrative: narratives.health    || report.health.narrative    },
    returns:   { ...report.returns,   narrative: narratives.returns   || report.returns.narrative   },
    peers:     { ...report.peers,     narrative: narratives.peers     || report.peers.narrative     },
    ownership: { ...report.ownership, narrative: narratives.ownership || report.ownership.narrative },
    theView: {
      ...report.theView,
      strengths:       narratives.strengths.length   ? narratives.strengths   : report.theView.strengths,
      watchPoints:     narratives.watchPoints.length ? narratives.watchPoints : report.theView.watchPoints,
      oneThingToTrack: narratives.oneThingToTrack    || report.theView.oneThingToTrack,
      disclaimer:      DISCLAIMER,
    },
  };
}
