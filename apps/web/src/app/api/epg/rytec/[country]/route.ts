import { NextRequest } from "next/server";
import { streamFileResponse } from "@/lib/xml-response";
import { countryRytecGzipPath, countryRytecPath } from "@/lib/epg-paths";
import { ensureCountryRytec } from "@/lib/ensure-epg";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: raw } = await params;
  const country = raw.replace(/\.xml\.gz$|\.xml$/i, "").toUpperCase();
  const wantsGzip = raw.endsWith(".gz") || request.headers.get("accept-encoding")?.includes("gzip");

  try {
    await ensureCountryRytec(country);
  } catch {
    return new Response("Rytec EPG not found for this country", { status: 404 });
  }

  const filePath = wantsGzip ? countryRytecGzipPath(country) : countryRytecPath(country);
  const ifNoneMatch = request.headers.get("if-none-match");

  return streamFileResponse(
    filePath,
    wantsGzip ? "application/gzip" : "application/xml; charset=utf-8",
    { gzip: wantsGzip, ifNoneMatch }
  );
}
