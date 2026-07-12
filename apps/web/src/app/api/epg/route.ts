import { EpgPwAdapter } from "@freeepg/epg-sources";
import { buildXmltv } from "@freeepg/epg-core";
import { streamFileResponse } from "@/lib/xml-response";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

export async function GET() {
  const globalPath = path.join(process.env.EPG_DATA_DIR ?? "../../data/epg", "global-lite.xml.gz");
  const { existsSync } = await import("node:fs");

  if (!existsSync(globalPath)) {
    const adapter = new EpgPwAdapter();
    const doc = await adapter.fetchGlobal();
    if (!doc) return new Response("Global EPG not available", { status: 404 });
    const xml = buildXmltv(doc);
    await mkdir(path.dirname(globalPath), { recursive: true });
    await writeFile(globalPath.replace(".gz", ""), xml);
    await writeFile(globalPath, gzipSync(Buffer.from(xml)));
  }

  return streamFileResponse(globalPath, "application/gzip", { gzip: true });
}
