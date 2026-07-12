import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { m3uPlaylists, m3uEntries } from "@freeepg/db";
import { enrichM3u, matchM3uEntries } from "@freeepg/m3u-matcher";
import { BASE_URL } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDatabase();

  const [playlist] = await db
    .select()
    .from(m3uPlaylists)
    .where(eq(m3uPlaylists.id, id))
    .limit(1);

  if (!playlist) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await db
    .select()
    .from(m3uEntries)
    .where(eq(m3uEntries.playlistId, id));

  const matched = entries.map((e) => ({
    lineNumber: e.lineNumber,
    tvgName: e.tvgName ?? undefined,
    tvgId: e.tvgIdOriginal ?? undefined,
    tvgLogo: e.tvgLogo ?? undefined,
    groupTitle: e.groupTitle ?? undefined,
    streamUrl: e.streamUrl ?? "",
    rawExtinf: `#EXTINF:-1 tvg-id="${e.tvgIdOriginal ?? ""}" tvg-name="${e.tvgName ?? ""}",${e.tvgName ?? ""}`,
    tvgIdMatched: e.tvgIdMatched ?? undefined,
    matchConfidence: e.matchConfidence ?? 0,
    matchMethod: e.matchMethod ?? "unmatched",
  }));

  const epgUrl = `${BASE_URL}/api/epg/m3u/${id}.xml`;
  const header = `#EXTM3U x-tvg-url="${epgUrl}"\n`;
  const body = matched
    .map((m) => {
      const tvgId = m.tvgIdMatched ?? m.tvgId ?? "";
      const name = m.tvgName ?? "Unknown";
      return `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${name}",${name}\n${m.streamUrl || "http://placeholder"}`;
    })
    .join("\n");

  return new Response(header + body, {
    headers: {
      "Content-Type": "audio/x-mpegurl",
      "Content-Disposition": `attachment; filename="freeepg-${id}.m3u"`,
    },
  });
}
