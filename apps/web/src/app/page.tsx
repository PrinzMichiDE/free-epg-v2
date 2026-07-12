import { sql } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, generatedFiles } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { CountryCard } from "@/components/country/CountryCard";
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Weltweites EPG als XMLTV
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
          Kostenlos, self-hosted, für tausende Sender weltweit.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto text-center">
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <p className="text-2xl font-bold">{totalChannels.toLocaleString("de-DE")}</p>
          <p className="text-sm text-[var(--muted)]">Sender</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <p className="text-2xl font-bold">{countries.filter((c) => c.channelCount > 0).length}</p>
          <p className="text-sm text-[var(--muted)]">Länder</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <p className="text-2xl font-bold">{countries.filter((c) => c.hasEpg).length}</p>
          <p className="text-sm text-[var(--muted)]">EPG Feeds</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">Länder</h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Pro Land XMLTV- und Rytec-URL kopieren — Rytec für Enigma2 / EPGImport.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {countries.slice(0, 20).map((c) => (
            <CountryCard key={c.code} {...c} />
          ))}
        </div>
      </section>
    </div>
  );
}
