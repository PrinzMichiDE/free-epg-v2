import Link from "next/link";
import { sql } from "drizzle-orm";
import { Globe2, Radio, Server } from "lucide-react";
import { getDatabase } from "@/lib/db";
import { channels, generatedFiles } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { CountryCard } from "@/components/country/CountryCard";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
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
    <>
      <section className="relative border-b border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 hero-grid pointer-events-none" aria-hidden />
        <div className="page-shell relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[var(--accent)] mb-4 tracking-wide uppercase">
              Self-hosted EPG Infrastructure
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--foreground)] mb-5">
              Weltweites EPG als XMLTV und Rytec
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
              Kostenlose, selbst gehostete Programmdaten für tausende Sender.
              XMLTV für IPTV-Apps, Rytec für Enigma2 — automatisch generiert
              und per URL abrufbar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/countries">
                <Button size="lg">Länder-Feeds ansehen</Button>
              </Link>
              <Link href="/playlists">
                <Button variant="outline" size="lg">
                  Playlisten weltweit
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg">
                  Dokumentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell py-12 sm:py-16 space-y-14">
        <section
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          aria-label="Plattform-Statistiken"
        >
          <StatCard
            label="Sender"
            value={totalChannels.toLocaleString("de-DE")}
            icon={Radio}
          />
          <StatCard
            label="Länder mit Metadaten"
            value={activeCountries}
            icon={Globe2}
          />
          <StatCard label="Aktive EPG-Feeds" value={epgFeeds} icon={Server} />
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Länder-Feeds
              </h2>
              <p className="text-[var(--muted-foreground)] mt-2 max-w-xl">
                XMLTV- oder Rytec-URL direkt kopieren. Details und Channel-Maps
                pro Land in der Übersicht.
              </p>
            </div>
            <Link
              href="/countries"
              className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4 shrink-0"
            >
              Alle {EPG_PW_COUNTRIES.length} Länder anzeigen
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.slice(0, 20).map((c) => (
              <CountryCard key={c.code} {...c} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Playlisten weltweit
              </h2>
              <p className="text-[var(--muted-foreground)] mt-2 max-w-xl">
                Fertige M3U-Playlists aus iptv-org, nach Land gruppiert — mit
                tvg-id und passender EPG-URL für Kodi, VLC und Enigma2.
              </p>
            </div>
            <Link
              href="/playlists"
              className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4 shrink-0"
            >
              Alle Playlisten ansehen
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              Kein manuelles Suchen von Stream-URLs: FreeEPG baut pro Land eine
              M3U mit den besten verfügbaren Streams und verknüpft sie
              automatisch mit dem EPG.
            </p>
            <Link href="/playlists">
              <Button>Zum Playlist-Katalog</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
