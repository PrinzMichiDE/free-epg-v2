import { NextRequest, NextResponse } from "next/server";
import { streamFileResponse } from "@/lib/xml-response";
import { countryGzipPath, countryXmlPath } from "@/lib/epg-paths";
import { EpgNotReadyError, ensureCountryXml } from "@/lib/ensure-epg";
import { isSupportedEpgCountry, normalizeEpgCountryParam } from "@/lib/epg-access";
import { parseXmltv } from "@freeepg/epg-core";
import { readFile } from "node:fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: paramCountry } = await params;
  const format = request.nextUrl.searchParams.get("format");
  const rawFromPath = request.nextUrl.pathname.match(/\/api\/epg\/([^/]+)\/?$/)?.[1];
  const raw = decodeURIComponent(rawFromPath ?? paramCountry);
  const wantsJson = raw.endsWith(".json") || format === "json";
  const wantsGzip =
    !wantsJson &&
    (raw.endsWith(".gz") ||
      format === "gz" ||
      request.nextUrl.searchParams.get("gzip") === "1");

  const cleanCountry = wantsJson ? raw.replace(/\.json$/, "") : wantsGzip ? raw.replace(/\.gz$/, "") : raw.replace(/\.xml$/, "");
  const country = normalizeEpgCountryParam(cleanCountry);

  if (!isSupportedEpgCountry(country)) {
    return new Response("EPG not found for this country", { status: 404 });
  }

  try {
    await ensureCountryXml(country);
  } catch (err) {
    if (err instanceof EpgNotReadyError) {
      return new Response(
        `EPG for ${country} is being generated. Please retry in a few minutes.`,
        {
          status: 503,
          headers: {
            "Retry-After": "120",
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
    }
    return new Response("EPG not found for this country", { status: 404 });
  }

  if (wantsJson) {
    try {
      const xmlPath = countryXmlPath(country);
      const xml = await readFile(xmlPath, "utf-8");
      const doc = parseXmltv(xml);

      const programmesByChannel: Record<string, typeof doc.programmes> = {};
      for (const p of doc.programmes) {
        if (!programmesByChannel[p.channel]) {
          programmesByChannel[p.channel] = [];
        }
        programmesByChannel[p.channel].push({
          start: p.start,
          stop: p.stop,
          title: p.title,
          desc: p.desc,
          category: p.category,
        } as any);
      }

      const json = {
        generator: "FreeEPG",
        country,
        generatedAt: new Date().toISOString(),
        channels: doc.channels.map((ch) => ({
          id: ch.id,
          name: ch.displayName,
          icon: ch.icon,
          programmes: programmesByChannel[ch.id] || [],
        })),
      };

      return NextResponse.json(json, {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("[EPG JSON API] Failed to convert to JSON:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  const filePath = wantsGzip ? countryGzipPath(country) : countryXmlPath(country);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
