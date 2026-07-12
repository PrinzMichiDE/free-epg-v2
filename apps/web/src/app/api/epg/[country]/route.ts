import { NextRequest } from "next/server";
import { streamFileResponse } from "@/lib/xml-response";
import { countryXmlPath, countryGzipPath } from "@/lib/epg-paths";
import { EpgPwAdapter } from "@freeepg/epg-sources";
import { buildXmltv } from "@freeepg/epg-core";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

async function ensureEpgFile(country: string): Promise<string> {
  const filePath = countryXmlPath(country);
  const { existsSync } = await import("node:fs");
  if (existsSync(filePath)) return filePath;

  const adapter = new EpgPwAdapter();
  const doc = await adapter.fetchCountry(country);
  if (!doc) throw new Error("EPG not available");

  const xml = buildXmltv(doc);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, xml, "utf-8");
  await writeFile(countryGzipPath(country), gzipSync(Buffer.from(xml)));
  return filePath;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: raw } = await params;
  const country = raw.replace(/\.xml\.gz$|\.xml$/i, "").toUpperCase();
  const wantsGzip = raw.endsWith(".gz") || request.headers.get("accept-encoding")?.includes("gzip");

  try {
    await ensureEpgFile(country);
  } catch {
    return new Response("EPG not found for this country", { status: 404 });
  }

  const filePath = wantsGzip ? countryGzipPath(country) : countryXmlPath(country);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
