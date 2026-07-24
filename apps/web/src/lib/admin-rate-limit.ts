import { Redis } from "ioredis";

const WINDOW_SEC = 60;
const MAX_REQUESTS = 10;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

export async function checkAdminRateLimit(
  actorKey: string,
  options?: { windowSec?: number; maxRequests?: number }
): Promise<RateLimitResult> {
  const windowSec = options?.windowSec ?? WINDOW_SEC;
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS;
  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

  try {
    const redisKey = `admin:rate:${actorKey}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }
    if (count > maxRequests) {
      const ttl = await redis.ttl(redisKey);
      return {
        allowed: false,
        retryAfterSec: ttl > 0 ? ttl : windowSec,
      };
    }
    return { allowed: true };
  } finally {
    await redis.quit().catch(() => undefined);
  }
}
