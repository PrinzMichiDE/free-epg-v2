import { getDb } from "@freeepg/db";
import { sql } from "drizzle-orm";
import { Redis } from "ioredis";

export interface WorkerHealth {
  status: "ok" | "degraded" | "unhealthy";
  components: {
    database: { status: "ok" | "error"; latencyMs?: number };
    redis: { status: "ok" | "error" };
    worker: { status: "ok"; uptime: number };
  };
  timestamp: string;
}

const startTime = Date.now();

export async function checkWorkerHealth(): Promise<WorkerHealth> {
  const health: WorkerHealth = {
    status: "ok",
    components: {
      database: { status: "ok" },
      redis: { status: "ok" },
      worker: { status: "ok", uptime: Math.floor((Date.now() - startTime) / 1000) },
    },
    timestamp: new Date().toISOString(),
  };

  try {
    const db = getDb();
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    health.components.database.latencyMs = Date.now() - start;
  } catch (error) {
    health.components.database.status = "error";
    health.status = "unhealthy";
  }

  try {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
    const redis = new Redis(redisUrl);
    await redis.ping();
    await redis.quit();
  } catch (error) {
    health.components.redis.status = "error";
    health.status = health.status === "unhealthy" ? "unhealthy" : "degraded";
  }

  return health;
}
