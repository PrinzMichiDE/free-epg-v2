import { NextRequest } from "next/server";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import {
  parseRytecCountryRequest,
  readCountryRytecPayload,
} from "@/lib/ensure-epg";
import { streamFileResponse } from "@/lib/xml-response";
import { countryRytecGzipPath, countryRytecPath } from "@/lib/epg-paths";
import { existsSync } from "node:fs";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: paramCountry } = await params;
  const format = request.nextUrl.searchParams.get("format");
  const { country, wantsGzip: gzipFromPath, raw } = parseRytecCountryRequest(
    request.nextUrl.pathname,
    paramCountry
  );
  const wantsGzip =
    gzipFromPath || format === "gz" || request.nextUrl.searchParams.get("gzip") === "1";

  if (!SUPPORTED_EPG_COUNTRIES.includes(country)) {
    return new Response(`Unknown country: ${raw}`, { status: 404 });
  }

  const gzipPath = countryRytecGzipPath(country);
  const xmlPath = countryRytecPath(country);
  const diskPath = wantsGzip ? gzipPath : xmlPath;

  if (existsSync(diskPath)) {
    return streamFileResponse(
      diskPath,
      wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
      { gzip: wantsGzip, ifNoneMatch: request.headers.get("if-none-match") }
    );
  }

  try {
    const payload = await readCountryRytecPayload(country, wantsGzip);
    const body = typeof payload === "string" ? payload : new Uint8Array(payload);

    return new Response(body, {
      headers: {
        "Content-Type": wantsGzip
          ? "application/gzip"
          : "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error(`[rytec] ${country}:`, err);
    return new Response("Rytec EPG not found for this country", { status: 404 });
  }
}
