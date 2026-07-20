"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Search,
  Star,
  Tv,
} from "lucide-react";
import { TvPlayer } from "@/components/player/TvPlayer";
import { ChannelEpgPanel } from "@/components/player/ChannelEpgPanel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerData, PlaylistPlayerEntry } from "@/lib/playlists";
import { usePlaylistFavorites } from "@/lib/player/favorites";
import { readLastChannelId, writeLastChannelId } from "@/lib/player/last-channel";
import { useChannelNavigation } from "@/lib/player/use-channel-navigation";

interface PlaylistWatchViewProps {
  playlist: PlaylistPlayerData;
  backHref: string;
}

function resolveInitialChannelId(
  playlist: PlaylistPlayerData
): string | null {
  const saved = readLastChannelId(playlist.code);
  if (saved && playlist.entries.some((entry) => entry.id === saved)) {
    return saved;
  }
  return playlist.entries[0]?.id ?? null;
}

function ChannelLogo({ entry }: { entry: PlaylistPlayerEntry }) {
  if (!entry.logoUrl) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
        {entry.title.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={entry.logoUrl}
      alt=""
      className="h-7 w-7 shrink-0 rounded-md bg-[var(--surface-muted)] object-contain p-0.5"
    />
  );
}

export function PlaylistWatchView({ playlist, backHref }: PlaylistWatchViewProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(() =>
    resolveInitialChannelId(playlist)
  );
  const activeItemRef = useRef<HTMLLIElement | null>(null);

  const { favorites, toggleFavorite, isFavorite } = usePlaylistFavorites(
    playlist.code
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return playlist.entries.filter((entry) => {
      if (favoritesOnly && !favorites.has(entry.id)) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.groupTitle?.toLowerCase().includes(q) ||
        entry.tvgId.toLowerCase().includes(q)
      );
    });
  }, [favorites, favoritesOnly, playlist.entries, query]);

  const activeChannel: PlaylistPlayerEntry | null = useMemo(() => {
    const selected = activeId
      ? playlist.entries.find((entry) => entry.id === activeId)
      : null;
    if (selected && filtered.some((entry) => entry.id === selected.id)) {
      return selected;
    }
    return filtered[0] ?? null;
  }, [activeId, filtered, playlist.entries]);

  const selectChannel = (entryId: string) => {
    setActiveId(entryId);
    writeLastChannelId(playlist.code, entryId);
  };

  const { selectPrevious, selectNext } = useChannelNavigation({
    entries: filtered,
    activeId: activeChannel?.id ?? null,
    onSelect: selectChannel,
  });

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeChannel?.id]);

  const groups = useMemo(() => {
    const favoriteEntries = filtered.filter((entry) => favorites.has(entry.id));
    const map = new Map<string, PlaylistPlayerEntry[]>();

    if (favoriteEntries.length > 0 && !favoritesOnly) {
      map.set(t("player.favorites"), favoriteEntries);
    }

    for (const entry of filtered) {
      if (!favoritesOnly && favorites.has(entry.id)) continue;
      const key = entry.groupTitle ?? t("player.allChannels");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    return [...map.entries()];
  }, [favorites, favoritesOnly, filtered, t]);

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
          <div className="p-3 border-b border-[var(--border)] shrink-0 space-y-2">
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

            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                favoritesOnly
                  ? "bg-amber-400/15 text-amber-500"
                  : "bg-[var(--surface-muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Star
                className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")}
                aria-hidden
              />
              {t("player.favoritesOnly")}
            </button>
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
                      <li
                        key={entry.id}
                        ref={isActive ? activeItemRef : undefined}
                      >
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
                            onClick={() => selectChannel(entry.id)}
                            className={cn(
                              "flex-1 text-left px-2 py-2.5 rounded-lg text-sm transition-colors",
                              "flex items-center gap-2.5 min-h-[44px]",
                              isActive
                                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)]"
                            )}
                          >
                            <ChannelLogo entry={entry} />
                            <span className="truncate">{entry.title}</span>
                            {!isActive && (
                              <Play
                                className="h-3.5 w-3.5 shrink-0 opacity-50 ml-auto"
                                aria-hidden
                              />
                            )}
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
            retryLabel={t("player.retry")}
            pipLabel={t("player.pip")}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={selectPrevious}
              disabled={filtered.length < 2}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t("player.prevChannel")}
            </button>
            <button
              type="button"
              onClick={selectNext}
              disabled={filtered.length < 2}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
            >
              {t("player.nextChannel")}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            {t("player.keyboardHint")}
          </p>

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
