import { sql } from "drizzle-orm";
import { generatedFiles } from "@freeepg/db";
import { getDatabase } from "@/lib/db";
import { getCountryName } from "@/lib/countries";
import {
  buildEpgCountryStatuses,
  EPG_FRESH_MAX_AGE_HOURS,
} from "@/lib/epg-status";

export async function GET() {
  const db = getDatabase();
  const rows = await db
    .select({
      country: generatedFiles.country,
      lastGenerated: sql`max(${generatedFiles.generatedAt})`,
    })
    .from(generatedFiles)
    .where(sql`${generatedFiles.country} IS NOT NULL`)
    .groupBy(generatedFiles.country);

  const lastGeneratedByCountry = new Map(
    rows
      .filter((row) => row.country !== null)
      .map((row) => [row.country as string, row.lastGenerated as Date])
  );

  return Response.json(
    {
      updated: new Date().toISOString(),
      maxAgeHours: EPG_FRESH_MAX_AGE_HOURS,
      countries: buildEpgCountryStatuses(lastGeneratedByCountry, undefined, new Date(), getCountryName),
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
