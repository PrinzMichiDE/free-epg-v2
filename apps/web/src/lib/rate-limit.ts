import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    return redis;
  } catch {
    return null;
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const client = getRedis();
  if (!client) {
    // Fail open if Redis is unavailable
    return { success: true, limit, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  try {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const reset = now + windowMs;
    const redisKey = `rl:${key}`;

    const count = await client.incr(redisKey);
    if (count === 1) {
      await client.expire(redisKey, windowSeconds);
    }

    const remaining = Math.max(0, limit - count);
    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch {
    // Fail open on errors
    return { success: true, limit, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }
}
