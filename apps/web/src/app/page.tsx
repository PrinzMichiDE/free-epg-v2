import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, generatedFiles } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { HomePageContent } from "@/components/home/HomePageContent";
import { countryEpgPaths } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCountriesData() {
  const db = getDatabase();

  const stats = await db
    .select({
      country: channels.country,
      count: sql<number>`count(*)::int`,
    })
    .from(channels)
    .groupBy(channels.country);

  const files = await db.select().from(generatedFiles);
  const fileMap = new Map(files.map((f) => [f.country, f]));

  return EPG_PW_COUNTRIES.map((code) => {
    const stat = stats.find((s) => s.country === code);
    const file = fileMap.get(code);
    const paths = countryEpgPaths(code);
    return {
      code,
      channelCount: stat?.count ?? 0,
      hasEpg: !!file,
      lastUpdate: file?.generatedAt?.toISOString() ?? null,
      xmlUrl: paths.xmlUrl,
      rytecGzipUrl: paths.rytecGzipUrl,
    };
  }).sort((a, b) => b.channelCount - a.channelCount);
}

export default async function HomePage() {
  let countries: Awaited<ReturnType<typeof getCountriesData>> = [];
  let totalChannels = 0;

  try {
    countries = await getCountriesData();
    totalChannels = countries.reduce((s, c) => s + c.channelCount, 0);
  } catch {
    countries = EPG_PW_COUNTRIES.map((code) => {
      const paths = countryEpgPaths(code);
      return {
        code,
        channelCount: 0,
        hasEpg: false,
        lastUpdate: null,
        xmlUrl: paths.xmlUrl,
        rytecGzipUrl: paths.rytecGzipUrl,
      };
    });
  }

  const activeCountries = countries.filter((c) => c.channelCount > 0).length;
  const epgFeeds = countries.filter((c) => c.hasEpg).length;

  return (
    <HomePageContent
      countries={countries}
      totalChannels={totalChannels}
      activeCountries={activeCountries}
      epgFeeds={epgFeeds}
    />
  );
}
