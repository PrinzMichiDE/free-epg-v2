"use client";

import Link from "next/link";
import { ExternalLink, Play, Tv } from "lucide-react";
import { ChannelEpgPanel } from "@/components/player/ChannelEpgPanel";
import { CountryFlag } from "@/components/country/CountryFlag";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface ChannelDetailViewProps {
  channel: {
    xmltvId: string;
    name: string;
    country: string;
    hasEpg: boolean | null;
    categories: string[] | null;
    website: string | null;
    logoUrl: string | null;
    altNames: string[] | null;
    lang: string | null;
  };
}

export function ChannelDetailView({ channel }: ChannelDetailViewProps) {
  const { t } = useI18n();
  const categories = channel.categories ?? [];
  const altNames = channel.altNames ?? [];

  return (
    <div className="page-shell py-10 sm:py-14 max-w-4xl">
      <header className="mb-10">
        <div className="flex flex-wrap items-start gap-4 mb-4">
          {channel.logoUrl ? (
            <img
              src={channel.logoUrl}
              alt=""
              className="h-16 w-16 rounded-xl object-contain bg-[var(--surface-muted)] border border-[var(--border)] p-2"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center">
              <Tv className="h-8 w-8 text-[var(--muted-foreground)]" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CountryFlag code={channel.country} size="md" />
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {channel.country}
                {channel.lang ? ` · ${channel.lang}` : ""}
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              {channel.name}
            </h1>
            <p className="font-mono text-sm text-[var(--muted-foreground)]">
              {channel.xmltvId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {channel.hasEpg ? (
            <Badge variant="success">{t("channelDetail.epgAvailable")}</Badge>
          ) : (
            <Badge variant="warning">{t("channelDetail.noEpg")}</Badge>
          )}
          {categories.map((cat) => (
            <Badge key={cat} variant="muted">
              {cat}
            </Badge>
          ))}
        </div>

        {altNames.length > 0 && (
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            <span className="font-medium text-[var(--foreground)]">
              {t("channelDetail.altNames")}:{" "}
            </span>
            {altNames.join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/playlists/${channel.country.toLowerCase()}/watch`}>
            <Button size="sm" className="gap-2">
              <Play className="h-4 w-4" aria-hidden />
              {t("channelDetail.watchInPlayer")}
            </Button>
          </Link>
          {channel.website && (
            <a href={channel.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" aria-hidden />
                {t("channelDetail.website")}
              </Button>
            </a>
          )}
        </div>
      </header>

      <div className="space-y-8">
        <ChannelEpgPanel tvgId={channel.xmltvId} channelTitle={channel.name} />
        <EpgFeedsPanel countryCode={channel.country} />
      </div>
    </div>
  );
}
