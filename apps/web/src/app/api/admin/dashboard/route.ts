import { getServerSession } from "next-auth";
import { desc, sql, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  epgSources,
  epgJobs,
  channels,
  analyticsDaily,
  analyticsEvents,
} from "@freeepg/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDatabase();

  const sources = await db.select().from(epgSources);
  const recentJobs = await db
    .select()
    .from(epgJobs)
    .orderBy(desc(epgJobs.createdAt))
    .limit(10);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(channels);

  const [{ withEpg }] = await db
    .select({ withEpg: sql<number>`count(*)::int` })
    .from(channels)
    .where(eq(channels.hasEpg, true));

  const failedJobs = recentJobs.filter((j) => j.status === "failed").length;

  return Response.json({
    stats: {
      totalChannels: total,
      channelsWithEpg: withEpg,
      coverage: total > 0 ? Math.round((withEpg / total) * 100) : 0,
      failedJobs,
    },
    sources,
    recentJobs,
  });
}
