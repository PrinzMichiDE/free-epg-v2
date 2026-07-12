import { eq, and, asc, gt, lt } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, programmes } from "@freeepg/db";

export interface ChannelEpgProgramme {
  id: number;
  start: string;
  stop: string;
  title: string;
  description: string | null;
  category: string | null;
}

export interface ChannelEpgResponse {
  channel: {
    xmltvId: string;
    name: string;
    logoUrl: string | null;
  } | null;
  current: ChannelEpgProgramme | null;
  upcoming: ChannelEpgProgramme[];
}

function mapProgramme(row: {
  id: number;
  start: Date;
  stop: Date;
  title: string;
  description: string | null;
  category: string | null;
}): ChannelEpgProgramme {
  return {
    id: row.id,
    start: row.start.toISOString(),
    stop: row.stop.toISOString(),
    title: row.title,
    description: row.description,
    category: row.category,
  };
}

export async function getChannelEpg(xmltvId: string): Promise<ChannelEpgResponse> {
  const db = getDatabase();
  const decodedId = decodeURIComponent(xmltvId);

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.xmltvId, decodedId))
    .limit(1);

  if (!channel) {
    return { channel: null, current: null, upcoming: [] };
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(programmes)
    .where(
      and(
        eq(programmes.channelId, channel.id),
        gt(programmes.stop, now),
        lt(programmes.start, horizon)
      )
    )
    .orderBy(asc(programmes.start))
    .limit(40);

  const mapped = rows.map(mapProgramme);
  const nowMs = now.getTime();
  const current =
    mapped.find((p) => {
      const start = new Date(p.start).getTime();
      const stop = new Date(p.stop).getTime();
      return start <= nowMs && stop > nowMs;
    }) ?? null;

  const upcoming = mapped.filter((p) => new Date(p.start).getTime() > nowMs);

  return {
    channel: {
      xmltvId: channel.xmltvId,
      name: channel.name,
      logoUrl: channel.logoUrl,
    },
    current,
    upcoming,
  };
}
