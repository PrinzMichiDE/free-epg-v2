import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { buildRytecChannelsXml } from "@freeepg/epg-core";
import { channels } from "@freeepg/db";
import { getDatabase } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: raw } = await params;
  const country = raw.replace(/\.xml$/i, "").toUpperCase();

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
