import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, generatedFiles } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { CountryCard } from "@/components/country/CountryCard";
import { countryEpgPaths } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CountriesPage() {
  const db = getDatabase();

  let countries = EPG_PW_COUNTRIES.map((code) => {
    const paths = countryEpgPaths(code);
    return {
      code,
      channelCount: 0,
      hasEpg: false,
      lastUpdate: null as string | null,
      xmlUrl: paths.xmlUrl,
      rytecGzipUrl: paths.rytecGzipUrl,
    };
  });

  try {
    const stats = await db
      .select({
        country: channels.country,
        count: sql<number>`count(*)::int`,
      })
      .from(channels)
      .groupBy(channels.country);

    const files = await db.select().from(generatedFiles);
    const fileMap = new Map(files.map((f) => [f.country, f]));

    countries = EPG_PW_COUNTRIES.map((code) => {
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
  } catch {
    // DB not available during build/dev without postgres
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Alle Länder</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {countries.map((c) => (
          <CountryCard key={c.code} {...c} />
        ))}
      </div>
    </div>
  );
}
