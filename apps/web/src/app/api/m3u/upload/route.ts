import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import {
  m3uPlaylists,
  m3uEntries,
  m3uMatchOverrides,
  channels,
} from "@freeepg/db";
import {
  parseM3u,
  matchM3uEntries,
  enrichM3u,
} from "@freeepg/m3u-matcher";
import {
  buildXmltv,
  filterXmltvByChannelIds,
} from "@freeepg/epg-core";
import { EpgPwAdapter } from "@freeepg/epg-sources";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { BASE_URL } from "@/lib/utils";
import { m3uXmlPath } from "@/lib/epg-paths";

export async function POST(request: NextRequest) {
  const db = getDatabase();
  const contentType = request.headers.get("content-type") ?? "";
  let content = "";
  let name = "Uploaded Playlist";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body.url) {
      const res = await fetch(body.url, { signal: AbortSignal.timeout(30_000) });
      content = await res.text();
      name = body.name ?? new URL(body.url).hostname;
    } else if (body.content) {
      content = body.content;
      name = body.name ?? "Uploaded Playlist";
    }
  } else {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }
    content = await file.text();
    name = file.name.replace(/\.m3u8?$/i, "");
  }

  if (!content.includes("#EXTM3U") && !content.includes("#EXTINF:")) {
    return Response.json({ error: "Invalid M3U file" }, { status: 400 });
  }

  const entries = parseM3u(content);
  const catalog = await db.select().from(channels).limit(10000);
  const catalogRecords = catalog.map((c) => ({
    xmltvId: c.xmltvId,
    name: c.name,
    altNames: (c.altNames as string[]) ?? [],
    country: c.country,
  }));

  const overridesRows = await db.select().from(m3uMatchOverrides);
  const overrides = new Map(
    overridesRows.map((o) => [o.tvgNameNormalized, o.tvgIdMatched])
  );

  const matched = matchM3uEntries(entries, catalogRecords, overrides);
  const id = randomUUID().slice(0, 8);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const matchedCount = matched.filter((m) => m.matchConfidence >= 60).length;
  const epgUrl = `${BASE_URL}/api/epg/m3u/${id}.xml`;

  await db.insert(m3uPlaylists).values({
    id,
    name,
    sourceType: "upload",
    entryCount: entries.length,
    matchedCount,
    expiresAt,
  });

  for (const m of matched) {
    const ch = catalog.find((c) => c.xmltvId === m.tvgIdMatched);
    await db.insert(m3uEntries).values({
      playlistId: id,
      lineNumber: m.lineNumber,
      tvgName: m.tvgName,
      tvgIdOriginal: m.tvgId,
      tvgIdMatched: m.tvgIdMatched,
      tvgLogo: m.tvgLogo,
      groupTitle: m.groupTitle,
      streamUrl: m.streamUrl,
      matchConfidence: m.matchConfidence,
      matchMethod: m.matchMethod,
      channelId: ch?.id,
    });
  }

  const channelIds = matched
    .filter((m) => m.tvgIdMatched && m.matchConfidence >= 60)
    .map((m) => m.tvgIdMatched!);

  if (channelIds.length > 0) {
    await generateM3uEpg(id, channelIds);
  }

  const enriched = enrichM3u(content, matched, epgUrl);

  return Response.json({
    id,
    name,
    entryCount: entries.length,
    matchedCount,
    matchRate: Math.round((matchedCount / entries.length) * 100),
    epgUrl,
    reviewUrl: `/m3u/${id}`,
    downloadUrl: `/api/m3u/${id}/download.m3u`,
    enrichedPreview: enriched.split("\n").slice(0, 5).join("\n"),
  });
}

async function generateM3uEpg(id: string, channelIds: string[]) {
  const adapter = new EpgPwAdapter();
  const global = await adapter.fetchGlobal();
  if (!global) return;

  const filtered = filterXmltvByChannelIds(global, channelIds);
  const xml = buildXmltv(filtered);
  const filePath = m3uXmlPath(id);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, xml, "utf-8");
  await writeFile(`${filePath}.gz`, gzipSync(Buffer.from(xml)));

  const db = getDatabase();
  await db
    .update(m3uPlaylists)
    .set({ epgXmlPath: filePath })
    .where(eq(m3uPlaylists.id, id));
}
