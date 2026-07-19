"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { CountryFlag } from "@/components/country/CountryFlag";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { ProgrammeSearchResult } from "@/lib/programmes";

interface NowPlayingSectionClientProps {
  countryCode: string;
  programmes: ProgrammeSearchResult[];
}

function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(
    new Date(iso)
  );
}

export function NowPlayingSectionClient({
  countryCode,
  programmes,
}: NowPlayingSectionClientProps) {
  const { t, locale } = useI18n();
  const intlLocale = locale === "de" ? "de-DE" : locale;

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold tracking-tight inline-flex items-center gap-2">
          <Radio className="h-5 w-5 text-[var(--accent)]" aria-hidden />
          {t("nowPlaying.title")}
        </h2>
        <Link
          href={`/programmes?country=${countryCode}&when=now`}
          className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4"
        >
          {t("nowPlaying.viewAll")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {programmes.map((prog) => (
          <Link
            key={prog.id}
            href={`/channels/${encodeURIComponent(prog.channel.xmltvId)}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-[var(--muted-foreground)] tabular-nums mb-1">
              {formatTime(prog.start, intlLocale)} – {formatTime(prog.stop, intlLocale)}
            </p>
            <p className="font-semibold line-clamp-2">{prog.title}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 flex items-center gap-1.5">
              <CountryFlag code={prog.channel.country} size="sm" />
              {prog.channel.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
