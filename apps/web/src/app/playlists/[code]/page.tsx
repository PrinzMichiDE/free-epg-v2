import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ListMusic } from "lucide-react";
import { CountryFlag } from "@/components/country/CountryFlag";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { XmlUrlBox } from "@/components/epg/XmlUrlBox";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getCountryName } from "@/lib/countries";
import { getPlaylistCountry } from "@/lib/playlists";
import { countryEpgPaths } from "@/lib/utils";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";

export const dynamic = "force-dynamic";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cc = code.toUpperCase();

  if (!/^[A-Z]{2}$/.test(cc)) {
    notFound();
  }

  const playlist = await getPlaylistCountry(cc);
  if (!playlist) {
    notFound();
  }

  const hasCountryEpg = EPG_PW_COUNTRIES.includes(cc);
  const epgPaths = hasCountryEpg ? countryEpgPaths(cc) : null;

  return (
    <div className="page-shell py-10 sm:py-14">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Alle Playlisten
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <CountryFlag code={cc} size="lg" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {getCountryName(cc, { [cc]: playlist.name })}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 font-mono text-sm">
              {cc} · {playlist.channelCount.toLocaleString("de-DE")} Sender ·{" "}
              {playlist.streamCount.toLocaleString("de-DE")} Streams
            </p>
          </div>
          <Badge variant={playlist.hasEpg ? "success" : "muted"}>
            {playlist.hasEpg ? "Land-EPG verfügbar" : "Global-Lite EPG"}
          </Badge>
        </div>
        <p className="text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          M3U-Playlist mit iptv-org Streams für {playlist.name}. Die
          x-tvg-url zeigt auf das passende FreeEPG EPG — Land-Feed oder
          weltweites Lite-EPG.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <XmlUrlBox
          title="M3U Playlist"
          description="In IPTV-Apps als Quelle eintragen oder herunterladen."
          url={playlist.m3uUrl}
        />
        <XmlUrlBox
          title="EPG für diese Playlist"
          description={
            hasCountryEpg
              ? "Land-spezifisches XMLTV — empfohlen für diese Playlist."
              : "Global-Lite EPG — für Länder ohne eigenen Land-Feed."
          }
          url={
            epgPaths?.xmlUrl ??
            "/api/epg"
          }
          gzipUrl={
            epgPaths?.xmlGzipUrl ??
            undefined
          }
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <ButtonLink href={playlist.m3uUrl} size="md" download>
          <ListMusic className="h-4 w-4" aria-hidden />
          M3U herunterladen
        </ButtonLink>
        <ButtonLink href={playlist.m3uUrl} variant="outline" size="md">
          M3U öffnen
        </ButtonLink>
      </div>

      {hasCountryEpg && (
        <section>
          <EpgFeedsPanel countryCode={cc} showEnigma2Links />
        </section>
      )}
    </div>
  );
}
