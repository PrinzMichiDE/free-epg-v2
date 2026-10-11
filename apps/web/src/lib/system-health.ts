import { existsSync, statSync } from "node:fs";
import { Redis } from "ioredis";
import { sql } from "drizzle-orm";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { getDatabase } from "@/lib/db";
import { readBuildInfo, type BuildInfo } from "@/lib/app-version-server";
import { countryXmlPath } from "./epg-paths";
import { evaluateOverallHealth, type HealthStatus } from "@/lib/system-health-utils";

export type { HealthStatus } from "@/lib/system-health-utils";
export { evaluateOverallHealth } from "@/lib/system-health-utils";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  detail?: string;
}

const EPG_MAX_AGE_MS = 25 * 60 * 60 * 1000;

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

function checkEpgFreshness(): HealthCheckResult {
  let newestMtimeMs = 0;
  let found = false;

  for (const cc of SUPPORTED_EPG_COUNTRIES) {
    const filePath = countryXmlPath(cc);
    if (!existsSync(filePath)) continue;
    const mtimeMs = statSync(filePath).mtimeMs;
    if (mtimeMs > newestMtimeMs) newestMtimeMs = mtimeMs;
    found = true;
  }

  if (!found) {
    return { name: "epg", status: "error", detail: "no EPG files found" };
  }

  const ageMs = Date.now() - newestMtimeMs;
  const ageHours = Math.round((ageMs / 3_600_000) * 10) / 10;
  if (ageMs > EPG_MAX_AGE_MS) {
    return { name: "epg", status: "error", detail: `newest EPG file is ${ageHours}h old` };
  }
  return { name: "epg", status: "ok", detail: `newest EPG file is ${ageHours}h old` };
}

export async function runSystemHealthChecks(): Promise<{
  status: "healthy" | "degraded";
  checks: Record<string, HealthStatus>;
  timestamp: string;
}> {
  const results = await Promise.all([checkDatabase(), checkRedis()]);
  const checks: Record<string, HealthStatus> = { app: "ok" };
  for (const result of [...results, checkEpgFreshness()]) {
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
    checkEpgFreshness(),
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
