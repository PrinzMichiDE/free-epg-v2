"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PlaylistWatchView } from "@/components/player/PlaylistWatchView";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { PlaylistPlayerData } from "@/lib/playlists";

interface PlaylistWatchLoaderProps {
  playlistCode: string;
  backHref: string;
}

export function PlaylistWatchLoader({
  playlistCode,
  backHref,
}: PlaylistWatchLoaderProps) {
  const { t } = useI18n();
  const [playlist, setPlaylist] = useState<PlaylistPlayerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/playlists/${encodeURIComponent(playlistCode)}/entries`
        );
        if (!res.ok) {
          throw new Error("load failed");
        }
        const data = (await res.json()) as PlaylistPlayerData;
        if (!cancelled) {
          setPlaylist(data);
        }
      } catch {
        if (!cancelled) {
          setError(t("player.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [playlistCode, t]);

  if (loading) {
    return (
      <div className="page-shell py-24 flex flex-col items-center gap-4 text-[var(--muted-foreground)]">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <p>{t("player.loadingPlaylist")}</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="page-shell py-24 flex flex-col items-center text-center max-w-lg mx-auto">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--warning-muted)] text-[var(--warning)] mb-6">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          {t("player.loadErrorTitle")}
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
          {error ?? t("player.loadError")}
        </p>
        <Link href={backHref}>
          <Button>{t("player.back")}</Button>
        </Link>
      </div>
    );
  }

  return <PlaylistWatchView playlist={playlist} backHref={backHref} />;
}
