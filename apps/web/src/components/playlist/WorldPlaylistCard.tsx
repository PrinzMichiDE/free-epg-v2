"use client";

import Link from "next/link";
import { Globe2, ListMusic, Play } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { WorldPlaylistMeta } from "@/lib/playlists";

interface WorldPlaylistCardProps {
  playlist: WorldPlaylistMeta;
  className?: string;
}

export function WorldPlaylistCard({ playlist, className }: WorldPlaylistCardProps) {
  const { t } = useI18n();

  return (
    <article
      className={cn(
        "surface-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6",
        "border-[var(--accent)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--surface-muted)]/40",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Globe2 className="h-7 w-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {t("world.title")}
            </h2>
            <Badge variant="success">{t("world.badge")}</Badge>
          </div>
          <p className="text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
            {t("world.desc", { countries: formatNumber(playlist.countryCount) })}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 tabular-nums">
            {t("world.stats", {
              countries: formatNumber(playlist.countryCount),
              channels: formatNumber(playlist.channelCount),
              limit: formatNumber(playlist.entryLimit),
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <Link
          href={`/playlists/${playlist.slug}/watch`}
          className={cn(
            "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-medium",
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          )}
        >
          <Play className="h-4 w-4" aria-hidden />
          {t("player.watch")}
        </Link>
        <Link
          href={`/playlists/${playlist.slug}`}
          className={cn(
            "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg",
            "border border-[var(--border)] text-sm font-medium",
            "hover:bg-[var(--surface-muted)] transition-colors"
          )}
        >
          {t("common.details")}
        </Link>
        <ButtonLink href={playlist.m3uUrl} size="md" download>
          <ListMusic className="h-4 w-4" aria-hidden />
          {t("world.download")}
        </ButtonLink>
      </div>
    </article>
  );
}
