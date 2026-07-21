"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CountryFlag } from "@/components/country/CountryFlag";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface PlaylistCardProps {
  code: string;
  name: string;
  streamCount: number;
  channelCount: number;
  hasEpg: boolean;
  m3uUrl: string;
  epgUrl: string;
}

export function PlaylistCard({
  code,
  name,
  streamCount,
  channelCount,
  hasEpg,
  m3uUrl,
}: PlaylistCardProps) {
  const { t } = useI18n();

  return (
    <article className="surface-card p-4 flex flex-col gap-3 hover:border-[var(--foreground)]/25 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CountryFlag code={code} size="md" />
          <div className="min-w-0">
            <h3 className="font-medium text-base truncate">{name}</h3>
            <p className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
              {code} ·{" "}
              {t("card.playlistMeta", {
                channels: formatNumber(channelCount),
                streams: formatNumber(streamCount),
              })}
            </p>
          </div>
        </div>
        <Badge variant={hasEpg ? "success" : "muted"}>
          {hasEpg ? t("common.epg") : t("common.globalEpg")}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <Link
          href={`/playlists/${code.toLowerCase()}/watch`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          {t("player.watch")}
        </Link>
        <span className="text-[var(--border)]" aria-hidden>
          ·
        </span>
        <Link
          href={`/playlists/${code.toLowerCase()}`}
          className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {t("common.details")}
        </Link>
        <ButtonLink href={m3uUrl} variant="ghost" size="sm" className="h-auto px-0 py-0" download>
          {t("common.m3u")}
        </ButtonLink>
      </div>
    </article>
  );
}
