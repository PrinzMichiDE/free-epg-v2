import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { getDatabase } from "@/lib/db";
import { customLists } from "@freeepg/db";
import { buildXmltv, filterXmltvByChannelIds } from "@freeepg/epg-core";
import { EpgPwAdapter } from "@freeepg/epg-sources";
import { listXmlPath } from "@/lib/epg-paths";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, channelIds } = body as { name: string; channelIds: string[] };

  if (!name || !channelIds?.length) {
    return Response.json({ error: "name and channelIds required" }, { status: 400 });
  }

  const id = randomUUID().slice(0, 8);
  const db = getDatabase();
  await db.insert(customLists).values({ id, name, channelIds });

  const adapter = new EpgPwAdapter();
  const global = await adapter.fetchGlobal();
  if (global) {
    const filtered = filterXmltvByChannelIds(global, channelIds);
    const xml = buildXmltv(filtered);
    const filePath = listXmlPath(id);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, xml);
    await writeFile(`${filePath}.gz`, gzipSync(Buffer.from(xml)));
  }

  return Response.json({
    id,
    name,
    channelCount: channelIds.length,
    xmlUrl: `/api/epg/list/${id}.xml`,
  });
}
