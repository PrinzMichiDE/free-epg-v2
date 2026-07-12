import { Redis } from "ioredis";
import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = { app: "ok" };

  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
    await redis.ping();
    checks.redis = "ok";
    await redis.quit();
  } catch {
    checks.redis = "error";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  return Response.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
