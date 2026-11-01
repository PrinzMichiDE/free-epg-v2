import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, m3uPlaylists, m3uEntries } from "@freeepg/db";
import { parseM3u, matchM3uEntries } from "@freeepg/m3u-matcher";
import { MAX_M3U_BYTES } from "@/lib/m3u-access";

export async function POST(request: NextRequest) {
  const db = getDatabase();

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let entries: ReturnType<typeof parseM3u> = [];
    let sourceName: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (typeof body.playlistId === "string" && body.playlistId.trim()) {
        const playlistId = body.playlistId.trim();
        const playlist = await db
          .select()
          .from(m3uPlaylists)
          .where(eq(m3uPlaylists.id, playlistId))
          .limit(1);

        if (playlist.length === 0) {
          return Response.json({ error: "Playlist not found" }, { status: 404 });
        }

        const storedEntries = await db
          .select()
          .from(m3uEntries)
          .where(eq(m3uEntries.playlistId, playlistId));

        entries = storedEntries.map((e) => ({
          lineNumber: e.lineNumber,
          tvgName: e.tvgName ?? undefined,
          tvgId: e.tvgIdOriginal ?? undefined,
          tvgLogo: e.tvgLogo ?? undefined,
          groupTitle: e.groupTitle ?? undefined,
          displayName: e.tvgName ?? undefined,
          streamUrl: e.streamUrl ?? "",
          rawExtinf: `#EXTINF:-1${e.tvgIdOriginal ? ` tvg-id="${e.tvgIdOriginal}"` : ""}${e.tvgName ? ` tvg-name="${e.tvgName}"` : ""}${e.tvgLogo ? ` tvg-logo="${e.tvgLogo}"` : ""}${e.groupTitle ? ` group-title="${e.groupTitle}"` : ""},${e.tvgName ?? ""}`,
        }));
        sourceName = playlist[0].name;
      } else if (typeof body.content === "string") {
        if (Buffer.byteLength(body.content, "utf-8") > MAX_M3U_BYTES) {
          return Response.json(
            { error: `M3U content exceeds ${MAX_M3U_BYTES} bytes` },
            { status: 413 }
          );
        }
        entries = parseM3u(body.content);
        sourceName = typeof body.name === "string" ? body.name : undefined;
      } else if (Array.isArray(body.entries)) {
        entries = body.entries.map((e: any, idx: number) => ({
          lineNumber: e.lineNumber ?? idx + 1,
          tvgName: e.tvgName,
          tvgId: e.tvgId,
          tvgLogo: e.tvgLogo,
          groupTitle: e.groupTitle,
          displayName: e.displayName ?? e.tvgName,
          streamUrl: e.streamUrl ?? "",
          rawExtinf: e.rawExtinf ?? `#EXTINF:-1,${e.displayName ?? e.tvgName ?? ""}`,
        }));
      } else {
        return Response.json(
          { error: "Provide playlistId, content, or entries" },
          { status: 400 }
        );
      }
    } else {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }
      if (file.size > MAX_M3U_BYTES) {
        return Response.json(
          { error: `M3U file exceeds ${MAX_M3U_BYTES} bytes` },
          { status: 413 }
        );
      }
      const content = await file.text();
      entries = parseM3u(content);
      sourceName = file.name.replace(/\.m3u8?$/i, "");
    }

    if (entries.length === 0) {
      return Response.json({ error: "No entries to match" }, { status: 400 });
    }

    const catalog = await db.select().from(channels).limit(10000);
    const catalogRecords = catalog.map((c) => ({
      xmltvId: c.xmltvId,
      name: c.name,
      altNames: (c.altNames as string[]) ?? [],
      country: c.country,
    }));

    const matched = matchM3uEntries(entries, catalogRecords);

    const results = matched.map((m) => {
      const ch = catalog.find((c) => c.xmltvId === m.tvgIdMatched);
      return {
        lineNumber: m.lineNumber,
        tvgName: m.tvgName,
        tvgIdOriginal: m.tvgId,
        tvgIdMatched: m.tvgIdMatched ?? null,
        tvgLogo: m.tvgLogo,
        groupTitle: m.groupTitle,
        displayName: m.displayName,
        streamUrl: m.streamUrl,
        matchConfidence: m.matchConfidence,
        matchMethod: m.matchMethod,
        channel: ch
          ? {
              xmltvId: ch.xmltvId,
              name: ch.name,
              country: ch.country,
              logoUrl: ch.logoUrl,
            }
          : null,
      };
    });

    const matchedCount = results.filter((r) => r.matchConfidence >= 60).length;

    return Response.json({
      sourceName,
      entryCount: entries.length,
      matchedCount,
      matchRate: Math.round((matchedCount / entries.length) * 100),
      matches: results,
    });
  } catch (error) {
    console.error("[Channels Match API] Failed to match channels:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
