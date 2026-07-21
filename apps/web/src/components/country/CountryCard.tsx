"use client";

import Link from "next/link";
import { cn, formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface CountryCardProps {
  code: string;
  channelCount: number;
  hasEpg: boolean;
  lastUpdate: string | null;
  xmlUrl: string;
  rytecGzipUrl: string;
}

export function CountryCard({
  code,
  channelCount,
  hasEpg,
  lastUpdate,
  xmlUrl,
  rytecGzipUrl,
}: CountryCardProps) {
  const { t } = useI18n();
  const xmlGzipUrl = xmlUrl.endsWith(".xml") ? `${xmlUrl}.gz` : xmlUrl;

  return (
    <article className="group surface-card p-4 flex flex-col gap-3 hover:border-[var(--foreground)]/25 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CountryFlag code={code} size="md" />
          <div className="min-w-0">
            <h3 className="font-medium text-base truncate">{getCountryName(code)}</h3>
            <p className="text-xs font-mono text-[var(--muted-foreground)] mt-0.5">
              {code} · {t("card.channels", { count: formatNumber(channelCount) })}
            </p>
          </div>
        </div>
        <Badge variant={hasEpg ? "success" : "warning"}>
          {hasEpg ? t("common.epg") : t("common.pending")}
        </Badge>
      </div>

      {lastUpdate && (
        <p className="text-xs text-[var(--muted-foreground)]">
          {t("common.updated", { date: formatDate(lastUpdate) })}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        <Link
          href={`/countries/${code.toLowerCase()}`}
          className={cn(
            "text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors underline-offset-4 hover:underline"
          )}
        >
          {t("common.details")}
        </Link>
        <span className="text-[var(--border)]" aria-hidden>
          ·
        </span>
        <ButtonLink href={xmlGzipUrl} variant="ghost" size="sm" className="h-auto px-0 py-0">
          {t("common.xmltv")}
        </ButtonLink>
        <ButtonLink href={rytecGzipUrl} variant="ghost" size="sm" className="h-auto px-0 py-0">
          {t("common.rytec")}
        </ButtonLink>
      </div>
    </article>
  );
}
