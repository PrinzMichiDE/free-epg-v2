"use client";

import Link from "next/link";
import { Check, ExternalLink, ListMusic, Play, Radio } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
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
  epgUrl,
}: PlaylistCardProps) {
  const { t } = useI18n();

  return (
    <article className="surface-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CountryFlag code={code} size="md" />
          <div className="min-w-0">
            <h3 className="font-semibold text-base tracking-tight truncate">
              {name}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {code} ·{" "}
              {t("card.playlistMeta", {
                channels: formatNumber(channelCount),
                streams: formatNumber(streamCount),
              })}
            </p>
          </div>
        </div>
        <Badge variant={hasEpg ? "success" : "muted"}>
          {hasEpg ? (
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3" aria-hidden />
              {t("common.epg")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3" aria-hidden />
              {t("common.globalEpg")}
            </span>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <Link
          href={`/playlists/${code.toLowerCase()}/watch`}
          className={cn(
            "col-span-2 flex items-center justify-center gap-1.5",
            "h-10 rounded-lg text-sm font-medium",
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          )}
        >
          <Play className="h-4 w-4" aria-hidden />
          {t("player.watch")}
        </Link>
        <Link
          href={`/playlists/${code.toLowerCase()}`}
          className={cn(
            "col-span-1 flex items-center justify-center gap-1.5",
            "h-10 rounded-lg border border-[var(--border)] text-sm font-medium",
            "text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors duration-200"
          )}
        >
          {t("common.details")}
          <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </Link>
        <ButtonLink
          href={m3uUrl}
          variant="outline"
          size="sm"
          className="col-span-1 w-full"
          download
        >
          <ListMusic className="h-4 w-4" aria-hidden />
          {t("common.m3u")}
        </ButtonLink>
      </div>
    </article>
  );
}
