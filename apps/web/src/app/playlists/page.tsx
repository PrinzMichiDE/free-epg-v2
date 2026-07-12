import Link from "next/link";
import { Globe2, ListMusic } from "lucide-react";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { getPlaylistCountries } from "@/lib/playlists";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  let playlists: Awaited<ReturnType<typeof getPlaylistCountries>> = [];
  let loadError = false;

  try {
    playlists = await getPlaylistCountries();
  } catch {
    loadError = true;
  }

  const totalStreams = playlists.reduce((sum, p) => sum + p.streamCount, 0);
  const withEpg = playlists.filter((p) => p.hasEpg).length;

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-[var(--accent)] mb-3 tracking-wide uppercase inline-flex items-center gap-2">
          <Globe2 className="h-4 w-4" aria-hidden />
          IPTV Playlists
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Playlisten weltweit
        </h1>
        <p className="text-[var(--muted-foreground)] mt-3 max-w-2xl leading-relaxed">
          Fertige M3U-Playlists aus dem iptv-org Stream-Katalog, gruppiert nach
          Land. Jede Playlist enthält tvg-id-Werte und eine passende FreeEPG
          EPG-URL — bereit für Kodi, VLC oder Enigma2.
        </p>
        {!loadError && playlists.length > 0 && (
          <p className="text-sm text-[var(--muted-foreground)] mt-4 inline-flex items-center gap-2">
            <ListMusic className="h-4 w-4" aria-hidden />
            {playlists.length} Länder · {totalStreams.toLocaleString("de-DE")}{" "}
            Streams · {withEpg} mit Land-EPG
          </p>
        )}
      </header>

      {loadError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--warning-muted)] p-4 text-sm text-[var(--foreground)] mb-8">
          Playlists konnten gerade nicht geladen werden. Der Stream-Katalog wird
          beim ersten Aufruf von iptv-org synchronisiert — bitte in Kürze
          erneut versuchen.
        </div>
      )}

      {playlists.length === 0 && !loadError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center text-[var(--muted-foreground)]">
          Noch keine Playlists verfügbar. Nach dem ersten Sync erscheinen hier
          alle Länder mit Streams.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.code} {...playlist} />
        ))}
      </div>

      <p className="text-xs text-[var(--muted-foreground)] mt-10 max-w-3xl leading-relaxed">
        Stream-Quelle:{" "}
        <a
          href="https://github.com/iptv-org/iptv"
          className="text-[var(--primary)] hover:underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          iptv-org/iptv
        </a>
        . Verfügbarkeit und Geo-Blocking liegen beim jeweiligen Anbieter. Für
        eigene Listen siehe{" "}
        <Link
          href="/m3u"
          className="text-[var(--primary)] hover:underline underline-offset-4"
        >
          M3U Matcher
        </Link>
        .
      </p>
    </div>
  );
}
