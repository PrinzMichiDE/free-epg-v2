"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  LayoutList,
  Menu,
  Play,
  Search,
  Shuffle,
  Star,
  Tv,
  X,
} from "lucide-react";
import { TvPlayer } from "@/components/player/TvPlayer";
import { ChannelEpgPanel } from "@/components/player/ChannelEpgPanel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerData, PlaylistPlayerEntry } from "@/lib/playlists";
import { usePlaylistFavorites } from "@/lib/player/favorites";
import { readLastChannelId, writeLastChannelId } from "@/lib/player/last-channel";
import { useChannelNavigation } from "@/lib/player/use-channel-navigation";
import { writeRecentChannel } from "@/lib/player/recent-channels";
import type { ChannelEpgProgramme } from "@/lib/player/channel-epg";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showEpgPanel, setShowEpgPanel] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(() =>
    resolveInitialChannelId(playlist)
  );
  const activeItemRef = useRef<HTMLLIElement | null>(null);
  const [epgCache, setEpgCache] = useState<Map<string, ChannelEpgProgramme | null>>(new Map());

  const { favorites, toggleFavorite, isFavorite } = usePlaylistFavorites(
    playlist.code
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return playlist.entries.filter((entry) => {
      if (favoritesOnly && !favorites.has(entry.id)) return false;
      if (!q) return true;
      const prog = epgCache.get(entry.tvgId);
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.groupTitle?.toLowerCase().includes(q) ||
        entry.tvgId.toLowerCase().includes(q) ||
        prog?.title?.toLowerCase().includes(q) ||
        false
      );
    });
  }, [favorites, favoritesOnly, playlist.entries, query, epgCache]);

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
    setMobileDrawerOpen(false);
    const entry = playlist.entries.find((e) => e.id === entryId);
    if (entry) {
      writeRecentChannel({
        playlistCode: playlist.code,
        channelId: entry.id,
        title: entry.title,
        logoUrl: entry.logoUrl ?? null,
      });
    }
  };

  const { selectPrevious, selectNext } = useChannelNavigation({
    entries: filtered,
    activeId: activeChannel?.id ?? null,
    onSelect: selectChannel,
  });

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && filtered.length > 1) {
      selectNext();
    }
    if (isRightSwipe && filtered.length > 1) {
      selectPrevious();
    }
  };

  const shuffleChannel = () => {
    if (filtered.length === 0) return;
    const currentIndex = filtered.findIndex((e) => e.id === activeChannel?.id);
    let randomIndex;
    if (filtered.length === 1) {
      randomIndex = 0;
    } else {
      do {
        randomIndex = Math.floor(Math.random() * filtered.length);
      } while (randomIndex === currentIndex);
    }
    selectChannel(filtered[randomIndex]!.id);
  };

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeChannel?.id]);

  useEffect(() => {
    const toFetch = filtered.slice(0, 20).filter((entry) => !epgCache.has(entry.tvgId));
    if (toFetch.length === 0) return;
    let cancelled = false;
    Promise.all(
      toFetch.map(async (entry) => {
        try {
          const res = await fetch(`/api/channels/${encodeURIComponent(entry.tvgId)}`);
          if (!res.ok) throw new Error("epg failed");
          const data = await res.json();
          return { tvgId: entry.tvgId, current: data.current as ChannelEpgProgramme | null };
        } catch {
          return { tvgId: entry.tvgId, current: null };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setEpgCache((prev) => {
        const next = new Map(prev);
        for (const r of results) {
          next.set(r.tvgId, r.current);
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [filtered, epgCache]);

  const groups = useMemo(() => {
    const favoriteEntries = filtered.filter((entry) => favorites.has(entry.id));
    const map = new Map<string, PlaylistPlayerEntry[]>();

    if (favoriteEntries.length > 0 && !favoritesOnly) {
      map.set(t("player.favorites") || "Favorites", favoriteEntries);
    }

    for (const entry of filtered) {
      if (!favoritesOnly && favorites.has(entry.id)) continue;
      const key = entry.groupTitle ?? (t("player.allChannels") || "All channels");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    return [...map.entries()];
  }, [favorites, favoritesOnly, filtered, t]);

  return (
    <div className="page-shell py-4 sm:py-6 lg:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t("player.back")}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheaterMode((v) => !v)}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)] min-h-[44px] transition-colors"
            title={theaterMode ? t("player.exitTheaterMode") : t("player.theaterMode")}
            aria-label={theaterMode ? t("player.exitTheaterMode") : t("player.theaterMode")}
          >
            <Tv className="h-4 w-4" aria-hidden />
            <span className="hidden xl:inline">{theaterMode ? t("player.exitTheaterMode") : t("player.theaterMode")}</span>
          </button>
          <button
            type="button"
            onClick={shuffleChannel}
            className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)] min-h-[44px] transition-colors"
            title={t("player.shuffle")}
            aria-label={t("player.shuffle")}
          >
            <Shuffle className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t("player.shuffle")}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)] min-h-[44px] transition-colors"
            aria-label={t("player.openChannels")}
          >
            <Menu className="h-4 w-4" aria-hidden />
            <span>{t("player.badge")}</span>
          </button>
        </div>
      </div>

      <header className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-1 inline-flex items-center gap-2">
          <Tv className="h-4 w-4" aria-hidden />
          {t("player.badge")}
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-balance font-serif">
          {playlist.name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {t("player.channelCount", { count: playlist.entries.length })}
        </p>
      </header>

      <div
        className={cn(
          "grid gap-4 sm:gap-6",
          theaterMode
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
        )}
      >
        <aside
          className={cn(
            "hidden lg:flex flex-col",
            theaterMode && "hidden",
            "max-h-none lg:min-h-[600px]",
            "rounded-sm border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[var(--shadow-md)]"
          )}
        >
          <div className="p-3 border-b border-[var(--border)] shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="relative block flex-1">
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
                    "w-full h-11 pl-9 pr-3 rounded-sm text-base sm:text-sm",
                    "border border-[var(--border)] bg-[var(--surface-muted)]",
                    "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  )}
                />
              </label>
              <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--surface-muted)]"
                  )}
                  aria-label={t("player.channelList")}
                  title={t("player.channelList")}
                >
                  <LayoutList className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--surface-muted)]"
                  )}
                  aria-label={t("player.channelGrid")}
                  title={t("player.channelGrid")}
                >
                  <Grid3x3 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition-colors",
                favoritesOnly
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
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
                {viewMode === "list" ? (
                  <ul className="space-y-0.5">
                    {entries.map((entry) => {
                      const isActive = entry.id === activeChannel?.id;
                      const currentProg = epgCache.get(entry.tvgId);
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
                                "shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm transition-colors",
                                isFavorite(entry.id)
                                  ? "text-[var(--accent)]"
                                  : "text-[var(--muted-foreground)] hover:text-[var(--accent)]"
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
                                "flex-1 text-left px-2 py-2 rounded-sm text-sm transition-colors",
                                "flex items-center gap-2.5 min-h-[44px]",
                                isActive
                                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)]"
                              )}
                            >
                              <ChannelLogo entry={entry} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate">{entry.title}</span>
                                  {currentProg && !isActive && (
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" aria-hidden />
                                  )}
                                </div>
                                {currentProg && !isActive && (
                                  <p className="text-xs opacity-70 truncate mt-0.5">
                                    {currentProg.title}
                                  </p>
                                )}
                              </div>
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
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {entries.map((entry) => {
                      const isActive = entry.id === activeChannel?.id;
                      const currentProg = epgCache.get(entry.tvgId);
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => selectChannel(entry.id)}
                          className={cn(
                            "text-left p-2 rounded-sm transition-colors min-h-[60px]",
                            isActive
                              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                              : "bg-[var(--surface-muted)]/50 hover:bg-[var(--surface-muted)]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <ChannelLogo entry={entry} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-xs font-medium truncate">{entry.title}</p>
                                {currentProg && !isActive && (
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" aria-hidden />
                                )}
                              </div>
                              {currentProg && (
                                <p className="text-[10px] opacity-70 truncate mt-0.5">
                                  {currentProg.title}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <div
          className="space-y-4 min-w-0 order-1 lg:order-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <TvPlayer
            channel={activeChannel}
            errorLabel={t("player.playbackError")}
            loadingLabel={t("player.loading")}
            retryLabel={t("player.retry")}
            pipLabel={t("player.pip")}
            fullscreenLabel={t("player.fullscreen")}
            exitFullscreenLabel={t("player.exitFullscreen")}
            nowPlayingLabel={t("player.nowPlaying")}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={selectPrevious}
              disabled={filtered.length < 2}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none min-h-[44px] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t("player.prevChannel")}
            </button>
            <button
              type="button"
              onClick={selectNext}
              disabled={filtered.length < 2}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:pointer-events-none min-h-[44px] transition-colors"
            >
              {t("player.nextChannel")}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("player.keyboardHint")} • F: {t("player.fullscreen")}, M: {t("player.mute")}/{t("player.unmute")}, Space: Play/Pause, ←/→: {t("player.prevChannel")}/{t("player.nextChannel")}
            </p>
            {activeChannel && (
              <button
                type="button"
                onClick={() => setShowEpgPanel((v) => !v)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {showEpgPanel ? t("player.hideEpg") : t("player.showEpg")}
              </button>
            )}
          </div>

          {activeChannel && showEpgPanel && (
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

      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col rounded-t-sm border-t border-[var(--border)] bg-[var(--card)] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-[var(--accent)]" aria-hidden />
                <h2 className="font-semibold">{t("player.badge")}</h2>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t("player.channelCount", { count: playlist.entries.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-sm hover:bg-[var(--surface-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={t("player.closeChannels")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="p-3 border-b border-[var(--border)] space-y-2">
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
                  className="w-full h-11 pl-9 pr-3 rounded-sm text-base border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFavoritesOnly((value) => !value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium transition-colors flex-1 justify-center",
                    favoritesOnly
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  <Star className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")} aria-hidden />
                  {t("player.favoritesOnly")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium bg-[var(--surface-muted)] text-[var(--muted-foreground)]"
                >
                  {viewMode === "list" ? <Grid3x3 className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
                  {viewMode === "list" ? t("player.channelGrid") : t("player.channelList")}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
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
                  {viewMode === "list" ? (
                    <ul className="space-y-0.5">
                      {entries.map((entry) => {
                        const isActive = entry.id === activeChannel?.id;
                        const currentProg = epgCache.get(entry.tvgId);
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              onClick={() => selectChannel(entry.id)}
                              className={cn(
                                "w-full text-left px-2 py-2 rounded-sm text-sm transition-colors flex items-center gap-2.5 min-h-[48px]",
                                isActive
                                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                              )}
                            >
                              <ChannelLogo entry={entry} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate">{entry.title}</span>
                                  {currentProg && !isActive && (
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                  )}
                                </div>
                                {currentProg && !isActive && (
                                  <p className="text-xs opacity-70 truncate">{currentProg.title}</p>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {entries.map((entry) => {
                        const isActive = entry.id === activeChannel?.id;
                        const currentProg = epgCache.get(entry.tvgId);
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => selectChannel(entry.id)}
                            className={cn(
                              "text-left p-2 rounded-sm transition-colors min-h-[60px]",
                              isActive
                                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                : "bg-[var(--surface-muted)]/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <ChannelLogo entry={entry} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium truncate">{entry.title}</p>
                                  {currentProg && !isActive && (
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                  )}
                                </div>
                                {currentProg && (
                                  <p className="text-[10px] opacity-70 truncate">{currentProg.title}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
