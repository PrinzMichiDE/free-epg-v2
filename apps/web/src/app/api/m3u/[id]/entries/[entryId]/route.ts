import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { m3uEntries, m3uPlaylists, channels } from "@freeepg/db";
import { NextRequest } from "next/server";
import {
  expiredPlaylistResponse,
  isPlaylistExpired,
  isValidM3uId,
} from "@/lib/m3u-access";

/**
 * Manual rematch is playlist-scoped only.
 * Global m3u_match_overrides must not be writable from this public endpoint.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const { id, entryId } = await params;
  if (!isValidM3uId(id)) {
    return Response.json({ error: "Invalid playlist id" }, { status: 400 });
  }

  const entryNumericId = Number.parseInt(entryId, 10);
  if (!Number.isFinite(entryNumericId) || entryNumericId <= 0) {
    return Response.json({ error: "Invalid entry id" }, { status: 400 });
  }

  const body = await request.json();
  const { xmltvId } = body as { xmltvId?: unknown };
  if (typeof xmltvId !== "string" || !xmltvId.trim() || xmltvId.length > 200) {
    return Response.json({ error: "xmltvId is required" }, { status: 400 });
  }

  const db = getDatabase();
  const [playlist] = await db
    .select()
    .from(m3uPlaylists)
    .where(eq(m3uPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return Response.json({ error: "Entry not found" }, { status: 404 });
  }
  if (isPlaylistExpired(playlist.expiresAt)) {
    return expiredPlaylistResponse();
  }

  const [entry] = await db
    .select()
    .from(m3uEntries)
    .where(eq(m3uEntries.id, entryNumericId))
    .limit(1);

  if (!entry || entry.playlistId !== id) {
    return Response.json({ error: "Entry not found" }, { status: 404 });
  }

  const [ch] = await db
    .select()
    .from(channels)
    .where(eq(channels.xmltvId, xmltvId.trim()))
    .limit(1);

  if (!ch) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  await db
    .update(m3uEntries)
    .set({
      tvgIdMatched: xmltvId.trim(),
      matchConfidence: 100,
      matchMethod: "manual",
      channelId: ch.id,
    })
    .where(eq(m3uEntries.id, entry.id));

  return Response.json({ success: true, scope: "playlist" });
}
