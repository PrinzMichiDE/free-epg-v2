"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources/constants";
import { CountryCard } from "@/components/country/CountryCard";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface CountryItem {
  code: string;
  channelCount: number;
  hasEpg: boolean;
  lastUpdate: string | null;
  xmlUrl: string;
  rytecGzipUrl: string;
}

interface HomePageContentProps {
  countries: CountryItem[];
  totalChannels: number;
  activeCountries: number;
  epgFeeds: number;
}

export function HomePageContent({
  countries,
  totalChannels,
  activeCountries,
  epgFeeds,
}: HomePageContentProps) {
  const { t, locale } = useI18n();
  const numberLocale = locale === "de" ? "de-DE" : locale;

  return (
    <>
      <section className="border-b border-[var(--border)]">
        <div className="page-shell py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="section-kicker">{t("home.badge")}</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold text-balance mb-5">
              {t("home.title")}
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-xl">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-2">
              <Link href="/countries">
                <Button size="lg">{t("home.ctaCountries")}</Button>
              </Link>
              <Link href="/playlists">
                <Button variant="outline" size="lg">
                  {t("home.ctaPlaylists")}
                </Button>
              </Link>
              <Link href="/programmes">
                <Button variant="ghost" size="lg">
                  {t("home.ctaProgrammes")}
                </Button>
              </Link>
            </div>
          </div>

          <dl className="mt-12 pt-8 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
            <StatCard
              label={t("home.statChannels")}
              value={totalChannels.toLocaleString(numberLocale)}
            />
            <StatCard label={t("home.statCountries")} value={activeCountries} />
            <StatCard label={t("home.statFeeds")} value={epgFeeds} />
          </dl>
        </div>
      </section>

      <div className="page-shell py-12 sm:py-16 space-y-14 sm:space-y-16">
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="section-title">{t("home.sectionCountries")}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionCountriesDesc")}
              </p>
            </div>
            <Link
              href="/countries"
              className="link-arrow inline-flex items-center gap-1 shrink-0"
            >
              {t("home.viewAllCountries", { count: SUPPORTED_EPG_COUNTRIES.length })}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {countries.slice(0, 12).map((c) => (
              <CountryCard key={c.code} {...c} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div>
              <h2 className="section-title">{t("home.sectionPlaylists")}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionPlaylistsDesc")}
              </p>
            </div>
            <Link href="/playlists" className="link-arrow inline-flex items-center gap-1 shrink-0">
              {t("home.viewAllPlaylists")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="surface-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              {t("home.playlistsTeaser")}
            </p>
            <Link href="/playlists" className="shrink-0">
              <Button variant="outline">{t("home.playlistsCta")}</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
