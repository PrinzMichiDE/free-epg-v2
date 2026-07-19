import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { buildRytecChannelsXml } from "@freeepg/epg-core";
import { channels } from "@freeepg/db";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { getDatabase } from "@/lib/db";
import { parseRytecChannelsRequest } from "@/lib/ensure-epg";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: paramCountry } = await params;
  const country = parseRytecChannelsRequest(
    request.nextUrl.pathname,
    paramCountry
  );

  if (!SUPPORTED_EPG_COUNTRIES.includes(country)) {
    return new Response("Unknown country", { status: 404 });
  }

  const db = getDatabase();
  const rows = await db
    .select({ id: channels.xmltvId, name: channels.name })
    .from(channels)
    .where(eq(channels.country, country))
    .orderBy(channels.xmltvId);

  const xml = buildRytecChannelsXml(rows);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
