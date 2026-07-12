"use client";

import Link from "next/link";
import { Check, Clock, ExternalLink } from "lucide-react";
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
    <article className="surface-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CountryFlag code={code} size="md" />
          <div className="min-w-0">
            <h3 className="font-semibold text-base tracking-tight truncate">
              {getCountryName(code)}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {code} · {t("card.channels", { count: formatNumber(channelCount) })}
            </p>
          </div>
        </div>
        <Badge variant={hasEpg ? "success" : "warning"}>
          {hasEpg ? (
            <span className="inline-flex items-center gap-1">
              <Check className="h-3 w-3" aria-hidden />
              {t("common.epg")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {t("common.pending")}
            </span>
          )}
        </Badge>
      </div>

      {lastUpdate && (
        <p className="text-xs text-[var(--muted-foreground)]">
          {t("common.updated", { date: formatDate(lastUpdate) })}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <Link
          href={`/countries/${code.toLowerCase()}`}
          className={cn(
            "col-span-2 flex items-center justify-center gap-1.5",
            "h-10 rounded-lg border border-[var(--border)] text-sm font-medium",
            "text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors duration-200"
          )}
        >
          {t("common.details")}
          <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </Link>
        <ButtonLink
          href={xmlGzipUrl}
          variant="primary"
          size="sm"
          className="col-span-1 w-full"
        >
          {t("common.xmltv")}
        </ButtonLink>
        <ButtonLink
          href={rytecGzipUrl}
          variant="outline"
          size="sm"
          className="col-span-1 w-full"
        >
          {t("common.rytec")}
        </ButtonLink>
      </div>
    </article>
  );
}
