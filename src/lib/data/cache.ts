import type { DeepDiveReport } from "@/types/report";
import type { ReportCache } from "@/types/provider";

// In-memory cache — keyed by ticker:date, TTL enforced manually.
// Swap this out for Upstash Redis in production without touching callers.

interface Entry {
  report:    DeepDiveReport;
  expiresAt: number;
}

const store = new Map<string, Entry>();

const DEFAULT_TTL = 60 * 60 * 4; // 4 hours

export const memoryCache: ReportCache = {
  async get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.report;
  },

  async set(key, report, ttlSeconds = DEFAULT_TTL) {
    store.set(key, {
      report,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },
};
