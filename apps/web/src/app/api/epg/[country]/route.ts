import { NextRequest } from "next/server";
import { streamFileResponse } from "@/lib/xml-response";
import { countryGzipPath, countryXmlPath } from "@/lib/epg-paths";
import { EpgNotReadyError, ensureCountryXml } from "@/lib/ensure-epg";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: paramCountry } = await params;
  const format = request.nextUrl.searchParams.get("format");
  const rawFromPath = request.nextUrl.pathname.match(/\/api\/epg\/([^/]+)\/?$/)?.[1];
  const raw = decodeURIComponent(rawFromPath ?? paramCountry);
  const country = raw.replace(/\.xml\.gz$|\.xml$/i, "").toUpperCase();
  const wantsGzip =
    raw.endsWith(".gz") ||
    format === "gz" ||
    request.nextUrl.searchParams.get("gzip") === "1";

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

  const filePath = wantsGzip ? countryGzipPath(country) : countryXmlPath(country);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
