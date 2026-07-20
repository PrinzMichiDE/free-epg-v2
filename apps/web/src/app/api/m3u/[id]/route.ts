import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { m3uPlaylists, m3uEntries } from "@freeepg/db";
import {
  expiredPlaylistResponse,
  isPlaylistExpired,
  isValidM3uId,
} from "@/lib/m3u-access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isValidM3uId(id)) {
    return Response.json({ error: "Invalid playlist id" }, { status: 400 });
  }

  const db = getDatabase();

  const [playlist] = await db
    .select()
    .from(m3uPlaylists)
    .where(eq(m3uPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (isPlaylistExpired(playlist.expiresAt)) {
    return expiredPlaylistResponse();
  }

  const entries = await db
    .select({
      id: m3uEntries.id,
      lineNumber: m3uEntries.lineNumber,
      tvgName: m3uEntries.tvgName,
      tvgIdOriginal: m3uEntries.tvgIdOriginal,
      tvgIdMatched: m3uEntries.tvgIdMatched,
      groupTitle: m3uEntries.groupTitle,
      matchConfidence: m3uEntries.matchConfidence,
      matchMethod: m3uEntries.matchMethod,
    })
    .from(m3uEntries)
    .where(eq(m3uEntries.playlistId, id));

  return Response.json({
    playlist: {
      id: playlist.id,
      name: playlist.name,
      entryCount: playlist.entryCount,
      matchedCount: playlist.matchedCount,
      expiresAt: playlist.expiresAt,
      epgUrl: `/api/epg/m3u/${id}.xml`,
      downloadUrl: `/api/m3u/${id}/download.m3u`,
    },
    entries,
  });
}
