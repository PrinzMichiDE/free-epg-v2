import { NextResponse } from "next/server";
import { Redis } from "ioredis";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDatabase();

    const [channelCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(channels);

    const [epgChannelCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(channels)
      .where(sql`${channels.hasEpg} = true`);

    let usedMemory = 0;
    try {
      const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
      const redis = new Redis(redisUrl);
      const redisInfo = await redis.info();
      const memoryMatch = redisInfo.match(/used_memory:(\d+)/);
      usedMemory = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      await redis.quit();
    } catch {
      // ignore
    }

    const metrics = [
      `# HELP freeepg_channels_total Total number of channels`,
      `# TYPE freeepg_channels_total gauge`,
      `freeepg_channels_total ${channelCount.count}`,
      `# HELP freeepg_channels_with_epg_total Channels with EPG data`,
      `# TYPE freeepg_channels_with_epg_total gauge`,
      `freeepg_channels_with_epg_total ${epgChannelCount.count}`,
      `# HELP freeepg_redis_memory_bytes Redis memory usage`,
      `# TYPE freeepg_redis_memory_bytes gauge`,
      `freeepg_redis_memory_bytes ${usedMemory}`,
      `# HELP freeepg_up Service up status`,
      `# TYPE freeepg_up gauge`,
      `freeepg_up 1`,
    ].join("\n") + "\n";

    return new Response(metrics, {
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[Metrics API] Failed to collect metrics:", error);
    return new Response("# HELP freeepg_up Service up status\n# TYPE freeepg_up gauge\nfreeepg_up 0\n", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      },
    });
  }
}
