import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { m3uPlaylists } from "@freeepg/db";
import { streamFileResponse } from "@/lib/xml-response";
import { m3uXmlPath } from "@/lib/epg-paths";
import {
  expiredPlaylistResponse,
  isPlaylistExpired,
  isValidM3uId,
} from "@/lib/m3u-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const url = new URL(request.url);
  const id = rawId.replace(/\.xml(\.gz)?$/i, "");

  if (!isValidM3uId(id)) {
    return new Response("Invalid playlist id", { status: 400 });
  }

  const db = getDatabase();
  const [playlist] = await db
    .select({ expiresAt: m3uPlaylists.expiresAt })
    .from(m3uPlaylists)
    .where(eq(m3uPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return new Response("Not found", { status: 404 });
  }
  if (isPlaylistExpired(playlist.expiresAt)) {
    return expiredPlaylistResponse();
  }

  const wantsGzip =
    rawId.endsWith(".gz") ||
    url.pathname.endsWith(".gz") ||
    url.searchParams.get("format") === "gz";
  const filePath = wantsGzip ? `${m3uXmlPath(id)}.gz` : m3uXmlPath(id);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
