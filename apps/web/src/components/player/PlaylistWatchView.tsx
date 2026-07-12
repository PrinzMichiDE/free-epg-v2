"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, Search, Tv } from "lucide-react";
import { TvPlayer } from "@/components/player/TvPlayer";
import { ChannelEpgPanel } from "@/components/player/ChannelEpgPanel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerData, PlaylistPlayerEntry } from "@/lib/playlists";

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
    const map = new Map<string, PlaylistPlayerEntry[]>();
    for (const entry of filtered) {
      const key = entry.groupTitle ?? t("player.allChannels");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return [...map.entries()];
  }, [filtered, t]);

  return (
    <div className="page-shell py-6 sm:py-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {t("player.back")}
      </Link>

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent)] mb-1 inline-flex items-center gap-2">
            <Tv className="h-4 w-4" aria-hidden />
            {t("player.badge")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {t("player.channelCount", { count: playlist.entries.length })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="space-y-4 min-w-0">
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

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {t("player.disclaimer")}
          </p>
        </div>

        <aside className="flex flex-col min-h-[420px] lg:min-h-[520px] rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="p-3 border-b border-[var(--border)]">
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
                  "w-full h-10 pl-9 pr-3 rounded-lg text-sm",
                  "border border-[var(--border)] bg-[var(--surface-muted)]",
                  "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                )}
              />
            </label>
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
                <ul className="space-y-0.5">
                  {entries.map((entry) => {
                    const isActive = entry.id === activeChannel?.id;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(entry.id)}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                            "flex items-center gap-2 min-h-[44px]",
                            isActive
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                          )}
                        >
                          <Play className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                          <span className="truncate">{entry.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
