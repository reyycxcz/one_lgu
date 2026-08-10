import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Durable (cross-instance) rate limiting via Upstash Redis when configured;
// otherwise falls back to the original in-memory Map — same behavior as
// before, just resets on redeploy/restart and isn't shared across serverless
// instances. Either way the call site (proxy.ts) just awaits checkRateLimit().
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// One Ratelimit instance per distinct (windowMs, max) pair, reused across
// requests/paths that share the same limit shape — Upstash's own guidance,
// avoids constructing a new limiter (and its internal Lua script hash) per call.
const limiters = new Map<string, Ratelimit>();

function getLimiter(windowMs: number, max: number): Ratelimit {
  const key = `${windowMs}:${max}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkMemory(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function checkRateLimit(key: string, windowMs: number, max: number): Promise<boolean> {
  if (!redis) {
    return checkMemory(key, windowMs, max);
  }

  try {
    const { success } = await getLimiter(windowMs, max).limit(key);
    return success;
  } catch {
    // Upstash unreachable — fail open rather than taking every protected
    // route down over a third-party outage.
    return true;
  }
}
