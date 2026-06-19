import { Redis } from "@upstash/redis";
import type { DeepDiveReport } from "@/types/report";
import type { ReportCache } from "@/types/provider";

const CACHE_PREFIX = "wiq:report:";
const DEFAULT_TTL  = 60 * 60 * 4; // 4 hours

// Upstash Redis — only initialised when env vars present (production / CI)
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url:   process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-memory fallback for local dev (stateless — resets on cold start)
interface MemEntry { report: DeepDiveReport; expiresAt: number }
const mem = new Map<string, MemEntry>();

export const reportCache: ReportCache = {
  async get(key) {
    if (redis) {
      const val = await redis.get<DeepDiveReport>(`${CACHE_PREFIX}${key}`);
      return val ?? null;
    }
    const entry = mem.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { mem.delete(key); return null; }
    return entry.report;
  },

  async set(key, report, ttlSeconds = DEFAULT_TTL) {
    if (redis) {
      await redis.set(`${CACHE_PREFIX}${key}`, report, { ex: ttlSeconds });
      return;
    }
    mem.set(key, { report, expiresAt: Date.now() + ttlSeconds * 1000 });
  },
};
