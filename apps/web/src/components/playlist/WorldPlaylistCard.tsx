"use client";

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
        "surface-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5",
        "border-l-4 border-l-[var(--accent)]",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <Globe2 className="h-8 w-8 shrink-0 text-[var(--accent)] mt-0.5" aria-hidden />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold">{t("world.title")}</h2>
            <Badge variant="success">{t("world.badge")}</Badge>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
            {t("world.desc", { countries: formatNumber(playlist.countryCount) })}
          </p>
          <p className="text-xs font-mono text-[var(--muted-foreground)] mt-2 tabular-nums">
            {t("world.stats", {
              countries: formatNumber(playlist.countryCount),
              channels: formatNumber(playlist.channelCount),
              limit: formatNumber(playlist.entryLimit),
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col xs:flex-row flex-wrap gap-2 w-full lg:w-auto shrink-0">
        <ButtonLink href={`/playlists/${playlist.slug}/watch`} className="w-full xs:w-auto">
          <Play className="h-4 w-4" aria-hidden />
          {t("player.watch")}
        </ButtonLink>
        <ButtonLink href={`/playlists/${playlist.slug}`} variant="outline" className="w-full xs:w-auto">
          {t("common.details")}
        </ButtonLink>
        <ButtonLink href={playlist.m3uUrl} variant="outline" size="md" download className="w-full xs:w-auto">
          <ListMusic className="h-4 w-4" aria-hidden />
          {t("world.download")}
        </ButtonLink>
      </div>
    </article>
  );
}
