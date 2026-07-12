import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import {
  m3uPlaylists,
  m3uEntries,
  m3uMatchOverrides,
  channels,
} from "@freeepg/db";
import { normalizeChannelName } from "@freeepg/m3u-matcher";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const { id, entryId } = await params;
  const body = await request.json();
  const { xmltvId } = body as { xmltvId: string };

  const db = getDatabase();
  const [entry] = await db
    .select()
    .from(m3uEntries)
    .where(eq(m3uEntries.id, parseInt(entryId, 10)))
    .limit(1);

  if (!entry || entry.playlistId !== id) {
    return Response.json({ error: "Entry not found" }, { status: 404 });
  }

  const [ch] = await db
    .select()
    .from(channels)
    .where(eq(channels.xmltvId, xmltvId))
    .limit(1);

  await db
    .update(m3uEntries)
    .set({
      tvgIdMatched: xmltvId,
      matchConfidence: 100,
      matchMethod: "manual",
      channelId: ch?.id,
    })
    .where(eq(m3uEntries.id, entry.id));

  if (entry.tvgName) {
    const normalized = normalizeChannelName(entry.tvgName);
    await db
      .insert(m3uMatchOverrides)
      .values({ tvgNameNormalized: normalized, tvgIdMatched: xmltvId })
      .onConflictDoUpdate({
        target: m3uMatchOverrides.tvgNameNormalized,
        set: { tvgIdMatched: xmltvId },
      });
  }

  return Response.json({ success: true });
}
