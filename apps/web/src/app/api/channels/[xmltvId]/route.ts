import { eq, and, gte, lte } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, programmes } from "@freeepg/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ xmltvId: string }> }
) {
  const { xmltvId } = await params;
  const db = getDatabase();

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.xmltvId, decodeURIComponent(xmltvId)))
    .limit(1);

  if (!channel) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const progs = await db
    .select()
    .from(programmes)
    .where(
      and(
        eq(programmes.channelId, channel.id),
        gte(programmes.start, now),
        lte(programmes.start, tomorrow)
      )
    )
    .limit(20);

  return Response.json({ channel, programmes: progs });
}
