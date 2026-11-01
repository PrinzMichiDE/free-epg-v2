import { NextResponse } from "next/server";
import { EPG_OUTPUT_VERSION, EPG_GENERATOR_NAME } from "@freeepg/epg-core";
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

    return NextResponse.json(
      {
        version: EPG_OUTPUT_VERSION,
        generator: EPG_GENERATOR_NAME,
        generatedAt: new Date().toISOString(),
        sourceCount: 6,
        totalChannels: channelCount.count,
        channelsWithEpg: epgChannelCount.count,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("[EPG Version API] Failed to get version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
