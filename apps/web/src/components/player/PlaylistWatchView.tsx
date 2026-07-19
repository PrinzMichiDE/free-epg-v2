"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, Search, Star, Tv } from "lucide-react";
import { TvPlayer } from "@/components/player/TvPlayer";
import { ChannelEpgPanel } from "@/components/player/ChannelEpgPanel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerData, PlaylistPlayerEntry } from "@/lib/playlists";
import { usePlaylistFavorites } from "@/lib/player/favorites";

interface PlaylistWatchViewProps {
  playlist: PlaylistPlayerData;
  backHref: string;
}

export function PlaylistWatchView({ playlist, backHref }: PlaylistWatchViewProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(
    playlist.entries[0]?.id ?? null
  );

  const { favorites, toggleFavorite, isFavorite } = usePlaylistFavorites(
    playlist.code
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlist.entries;
    return playlist.entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.groupTitle?.toLowerCase().includes(q) ||
        entry.tvgId.toLowerCase().includes(q)
    );
  }, [playlist.entries, query]);

  const activeChannel: PlaylistPlayerEntry | null =
    playlist.entries.find((entry) => entry.id === activeId) ??
    filtered[0] ??
    null;

  const groups = useMemo(() => {
    const favoriteEntries = filtered.filter((entry) => favorites.has(entry.id));
    const map = new Map<string, PlaylistPlayerEntry[]>();

    if (favoriteEntries.length > 0) {
      map.set(t("player.favorites"), favoriteEntries);
    }

    for (const entry of filtered) {
      if (favorites.has(entry.id)) continue;
      const key = entry.groupTitle ?? t("player.allChannels");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    return [...map.entries()];
  }, [filtered, favorites, t]);

  return (
    <div className="page-shell py-4 sm:py-6 lg:py-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 sm:mb-6 transition-colors min-h-[44px]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {t("player.back")}
      </Link>

      <header className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-1 inline-flex items-center gap-2">
          <Tv className="h-4 w-4" aria-hidden />
          {t("player.badge")}
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-balance">
          {playlist.name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {t("player.channelCount", { count: playlist.entries.length })}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-4 sm:gap-6">
        <aside
          className={cn(
            "flex flex-col order-2 lg:order-none",
            "max-h-[min(50vh,28rem)] lg:max-h-none lg:min-h-[520px]",
            "rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
          )}
        >
          <div className="p-3 border-b border-[var(--border)] shrink-0">
            <label className="relative block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("player.searchPlaceholder")}
                className={cn(
                  "w-full h-11 pl-9 pr-3 rounded-lg text-base sm:text-sm",
                  "border border-[var(--border)] bg-[var(--surface-muted)]",
                  "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                )}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-2 overscroll-contain">
            {filtered.length === 0 && (
              <p className="p-4 text-sm text-[var(--muted-foreground)] text-center">
                {t("player.noResults")}
              </p>
            )}

            {groups.map(([group, entries]) => (
              <div key={group} className="mb-4 last:mb-0">
                {groups.length > 1 && (
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {group}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {entries.map((entry) => {
                    const isActive = entry.id === activeChannel?.id;
                    return (
                      <li key={entry.id}>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(entry.id)}
                            className={cn(
                              "shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors",
                              isFavorite(entry.id)
                                ? "text-amber-400"
                                : "text-[var(--muted-foreground)] hover:text-amber-400"
                            )}
                            aria-label={
                              isFavorite(entry.id)
                                ? t("player.removeFavorite")
                                : t("player.addFavorite")
                            }
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                isFavorite(entry.id) && "fill-current"
                              )}
                              aria-hidden
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveId(entry.id)}
                            className={cn(
                              "flex-1 text-left px-3 py-3 rounded-lg text-sm transition-colors",
                              "flex items-center gap-2 min-h-[44px]",
                              isActive
                                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)]"
                            )}
                          >
                            <Play className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                            <span className="truncate">{entry.title}</span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4 min-w-0 order-1 lg:order-none">
          <TvPlayer
            channel={activeChannel}
            errorLabel={t("player.playbackError")}
            loadingLabel={t("player.loading")}
          />

          {activeChannel && (
            <ChannelEpgPanel
              tvgId={activeChannel.tvgId}
              channelTitle={activeChannel.title}
            />
          )}

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed order-3 lg:order-none">
            {t("player.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
}
