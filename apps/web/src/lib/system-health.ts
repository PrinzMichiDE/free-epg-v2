import { Redis } from "ioredis";
import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { readBuildInfo, type BuildInfo } from "@/lib/app-version-server";
import {
  evaluateOverallHealth,
  type HealthStatus,
} from "@/lib/system-health-utils";

export type { HealthStatus } from "@/lib/system-health-utils";
export { evaluateOverallHealth } from "@/lib/system-health-utils";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  detail?: string;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);
    return { name: "database", status: "ok" };
  } catch (error) {
    return {
      name: "database",
      status: "error",
      detail: error instanceof Error ? error.message : "connection failed",
    };
  }
}

async function checkRedis(): Promise<HealthCheckResult> {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  let redis: Redis | undefined;
  try {
    redis = new Redis(redisUrl);
    await redis.ping();
    return { name: "redis", status: "ok" };
  } catch (error) {
    return {
      name: "redis",
      status: "error",
      detail: error instanceof Error ? error.message : "connection failed",
    };
  } finally {
    if (redis) await redis.quit().catch(() => undefined);
  }
}

export async function runSystemHealthChecks(): Promise<{
  status: "healthy" | "degraded";
  checks: Record<string, HealthStatus>;
  timestamp: string;
}> {
  const results = await Promise.all([checkDatabase(), checkRedis()]);
  const checks: Record<string, HealthStatus> = { app: "ok" };
  for (const result of results) {
    checks[result.name] = result.status;
  }

  return {
    status: evaluateOverallHealth(checks),
    checks,
    timestamp: new Date().toISOString(),
  };
}

export async function runDetailedSystemHealth(): Promise<{
  status: "healthy" | "degraded";
  checks: HealthCheckResult[];
  buildInfo: BuildInfo;
  environment: string;
  analyticsEnabled: boolean;
  timestamp: string;
}> {
  const [dbCheck, redisCheck, buildInfo] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    readBuildInfo(),
  ]);

  const checks: HealthCheckResult[] = [
    { name: "app", status: "ok" },
    dbCheck,
    redisCheck,
  ];
  const statusMap = Object.fromEntries(
    checks.map((c) => [c.name, c.status])
  ) as Record<string, HealthStatus>;

  return {
    status: evaluateOverallHealth(statusMap),
    checks,
    buildInfo,
    environment: process.env.NODE_ENV ?? "development",
    analyticsEnabled: process.env.ANALYTICS_ENABLED !== "false",
    timestamp: new Date().toISOString(),
  };
}
