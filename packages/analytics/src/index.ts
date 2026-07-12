import { createHash } from "node:crypto";
import { Redis } from "ioredis";
import { getDb, analyticsEvents, analyticsDaily } from "@freeepg/db";
import { sql, lt, eq, and } from "drizzle-orm";

export interface AnalyticsEvent {
  type: "page_view" | "api_request" | "custom_event";
  path?: string;
  method?: string;
  country?: string;
  statusCode?: number;
  responseTimeMs?: number;
  bytesSent?: number;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export function anonymizeIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) {
    parts[3] = "0";
    return createHash("sha256").update(parts.join(".")).digest("hex").slice(0, 16);
  }
  return createHash("sha256").update(ip.slice(0, ip.lastIndexOf(":"))).digest("hex").slice(0, 16);
}

export class AnalyticsTracker {
  private redis: Redis;
  private bufferKey = "freeepg:analytics:buffer";
  private enabled: boolean;

  constructor(redisUrl?: string) {
    this.redis = new Redis(
      redisUrl ?? process.env.REDIS_URL ?? "redis://localhost:6379"
    );
    this.enabled = process.env.ANALYTICS_ENABLED !== "false";
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled) return;
    const payload = {
      ...event,
      ipHash: event.ip ? anonymizeIp(event.ip) : undefined,
      ip: undefined,
      createdAt: new Date().toISOString(),
    };
    await this.redis.rpush(this.bufferKey, JSON.stringify(payload));
  }

  async flushToDb(): Promise<number> {
    const db = getDb();
    let count = 0;
    while (true) {
      const raw = await this.redis.lpop(this.bufferKey);
      if (!raw) break;
      const event = JSON.parse(raw) as AnalyticsEvent & { createdAt: string; ipHash?: string };
      await db.insert(analyticsEvents).values({
        type: event.type,
        path: event.path,
        method: event.method,
        country: event.country,
        statusCode: event.statusCode,
        responseTimeMs: event.responseTimeMs,
        bytesSent: event.bytesSent,
        referrer: event.referrer,
        userAgent: event.userAgent,
        ipHash: event.ipHash,
        createdAt: new Date(event.createdAt),
      });
      count++;
    }
    return count;
  }

  async aggregateDaily(date: string): Promise<void> {
    const db = getDb();
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const pageViews = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.type, "page_view"),
          sql`${analyticsEvents.createdAt} >= ${dayStart}`,
          sql`${analyticsEvents.createdAt} <= ${dayEnd}`
        )
      );

    const apiRequests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.type, "api_request"),
          sql`${analyticsEvents.createdAt} >= ${dayStart}`,
          sql`${analyticsEvents.createdAt} <= ${dayEnd}`
        )
      );

    const metrics = [
      { metric: "page_views", dimension: "", value: pageViews[0]?.count ?? 0 },
      { metric: "api_requests", dimension: "", value: apiRequests[0]?.count ?? 0 },
    ];

    for (const m of metrics) {
      await db
        .insert(analyticsDaily)
        .values({ date, metric: m.metric, dimension: m.dimension, value: m.value })
        .onConflictDoUpdate({
          target: [analyticsDaily.date, analyticsDaily.metric, analyticsDaily.dimension],
          set: { value: m.value },
        });
    }
  }

  async cleanupOldEvents(retentionDays = 90): Promise<number> {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await db
      .delete(analyticsEvents)
      .where(lt(analyticsEvents.createdAt, cutoff));
    return result.count ?? 0;
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export function extractCountryFromPath(path: string): string | undefined {
  const match = path.match(/\/api\/epg\/([a-z]{2})\.xml/i);
  return match ? match[1].toUpperCase() : undefined;
}
