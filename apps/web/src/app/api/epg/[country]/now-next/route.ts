import { NextRequest } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { channels, programmes } from "@freeepg/db";
import { getDatabase } from "@/lib/db";
import { isSupportedEpgCountry, normalizeEpgCountryParam } from "@/lib/epg-access";

interface ProgrammeItem {
  title: string;
  start: string;
  stop: string;
  category: string | null;
}

interface ChannelNowNext {
  name: string;
  xmltvId: string;
  now: ProgrammeItem | null;
  next: ProgrammeItem | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: paramCountry } = await params;
  const country = normalizeEpgCountryParam(paramCountry);

  if (!isSupportedEpgCountry(country)) {
    return new Response("EPG not found for this country", { status: 404 });
  }

  const db = getDatabase();
  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 3_600_000);

  const rows = await db
    .select({
      channelName: channels.name,
      xmltvId: channels.xmltvId,
      start: programmes.start,
      stop: programmes.stop,
      title: programmes.title,
      category: programmes.category,
    })
    .from(programmes)
    .innerJoin(channels, eq(programmes.channelId, channels.id))
    .where(
      and(
        eq(channels.country, country),
        gte(programmes.stop, now),
        lte(programmes.start, horizon)
      )
    )
    .orderBy(programmes.channelId, programmes.start);

  const byChannel = new Map<string, ChannelNowNext>();
  for (const row of rows) {
    let entry = byChannel.get(row.xmltvId);
    if (!entry) {
      entry = {
        name: row.channelName,
        xmltvId: row.xmltvId,
        now: null,
        next: null,
      };
      byChannel.set(row.xmltvId, entry);
    }

    const item: ProgrammeItem = {
      title: row.title,
      start: row.start.toISOString(),
      stop: row.stop.toISOString(),
      category: row.category,
    };

    if (row.start <= now && now < row.stop) {
      if (!entry.now) entry.now = item;
    } else if (row.start > now && !entry.next) {
      entry.next = item;
    }
  }

  const channelList = [...byChannel.values()].filter(
    (channel) => channel.now !== null || channel.next !== null
  );

  return Response.json(
    {
      country,
      generatedAt: now.toISOString(),
      channels: channelList,
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
