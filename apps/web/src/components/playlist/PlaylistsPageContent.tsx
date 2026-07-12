"use client";

import Link from "next/link";
import { Globe2, ListMusic } from "lucide-react";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { WorldPlaylistCard } from "@/components/playlist/WorldPlaylistCard";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistCountry, WorldPlaylistMeta } from "@/lib/playlists";

interface PlaylistsPageContentProps {
  playlists: PlaylistCountry[];
  world: WorldPlaylistMeta | null;
  loadError: boolean;
}

export function PlaylistsPageContent({
  playlists,
  world,
  loadError,
}: PlaylistsPageContentProps) {
  const { t, locale } = useI18n();
  const totalStreams = playlists.reduce((sum, p) => sum + p.streamCount, 0);
  const withEpg = playlists.filter((p) => p.hasEpg).length;

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-[var(--accent)] mb-3 tracking-wide uppercase inline-flex items-center gap-2">
          <Globe2 className="h-4 w-4" aria-hidden />
          {t("playlists.badge")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {t("playlists.title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-3 max-w-2xl leading-relaxed">
          {t("playlists.subtitle")}
        </p>
        {!loadError && playlists.length > 0 && (
          <p className="text-sm text-[var(--muted-foreground)] mt-4 inline-flex items-center gap-2">
            <ListMusic className="h-4 w-4" aria-hidden />
            {t("playlists.stats", {
              countries: playlists.length.toLocaleString(locale),
              streams: totalStreams.toLocaleString(locale),
              epg: withEpg.toLocaleString(locale),
            })}
          </p>
        )}
      </header>

      {loadError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--warning-muted)] p-4 text-sm text-[var(--foreground)] mb-8">
          {t("playlists.loadError")}
        </div>
      )}

      {playlists.length === 0 && !loadError && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center text-[var(--muted-foreground)]">
          {t("playlists.empty")}
        </div>
      )}

      {world && !loadError && (
        <section className="mb-10">
          <WorldPlaylistCard playlist={world} />
        </section>
      )}

      {!loadError && playlists.length > 0 && (
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          {t("playlists.byCountry")}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.code} {...playlist} />
        ))}
      </div>

      <p className="text-xs text-[var(--muted-foreground)] mt-10 max-w-3xl leading-relaxed">
        {t("playlists.disclaimer")}{" "}
        <Link
          href="/m3u"
          className="text-[var(--primary)] hover:underline underline-offset-4"
        >
          {t("nav.m3u")}
        </Link>
        .
      </p>
    </div>
  );
}
