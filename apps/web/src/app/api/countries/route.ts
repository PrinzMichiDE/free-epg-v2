import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, getLatestCountryFileMap } from "@freeepg/db";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { countryEpgPaths } from "@/lib/utils";

export async function GET() {
  const db = getDatabase();

  const stats = await db
    .select({
      country: channels.country,
      count: sql<number>`count(*)::int`,
    })
    .from(channels)
    .groupBy(channels.country);

  const fileMap = await getLatestCountryFileMap(db);

  const countries = SUPPORTED_EPG_COUNTRIES.map((code) => {
    const stat = stats.find((s) => s.country === code);
    const file = fileMap.get(code);
    const paths = countryEpgPaths(code);
    return {
      code,
      channelCount: stat?.count ?? 0,
      hasEpg: !!file,
      lastUpdate: file?.generatedAt ?? null,
      xmlUrl: paths.xmlUrl,
      xmlGzipUrl: paths.xmlGzipUrl,
      rytecUrl: paths.rytecUrl,
      rytecGzipUrl: paths.rytecGzipUrl,
      fileSize: file?.size ?? 0,
    };
  }).sort((a, b) => b.channelCount - a.channelCount);

  const totalChannels = stats.reduce((sum, s) => sum + s.count, 0);

  return Response.json({
    countries,
    stats: {
      totalChannels,
      totalCountries: countries.filter((c) => c.channelCount > 0).length,
      epgCountries: countries.filter((c) => c.hasEpg).length,
    },
  });
}
