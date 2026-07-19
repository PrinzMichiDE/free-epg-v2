"use client";

import Link from "next/link";
import { Globe2, Radio, Server } from "lucide-react";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
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
      <section className="relative border-b border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 hero-grid pointer-events-none" aria-hidden />
        <div className="page-shell relative py-12 sm:py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-3 sm:mb-4 tracking-wide uppercase">
              {t("home.badge")}
            </p>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--foreground)] mb-4 sm:mb-5 text-balance">
              {t("home.title")}
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-6 sm:mb-8 max-w-2xl">
              {t("home.subtitle")}
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-3">
              <Link href="/countries" className="w-full xs:w-auto">
                <Button size="lg" className="w-full xs:w-auto">
                  {t("home.ctaCountries")}
                </Button>
              </Link>
              <Link href="/playlists" className="w-full xs:w-auto">
                <Button variant="outline" size="lg" className="w-full xs:w-auto">
                  {t("home.ctaPlaylists")}
                </Button>
              </Link>
              <Link href="/docs" className="w-full xs:w-auto">
                <Button variant="outline" size="lg" className="w-full xs:w-auto">
                  {t("home.ctaDocs")}
                </Button>
              </Link>
              <Link href="/programmes" className="w-full xs:w-auto">
                <Button variant="outline" size="lg" className="w-full xs:w-auto">
                  {t("home.ctaProgrammes")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell py-8 sm:py-12 lg:py-16 space-y-10 sm:space-y-14">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t("home.statChannels")}
            value={totalChannels.toLocaleString(numberLocale)}
            icon={Radio}
          />
          <StatCard
            label={t("home.statCountries")}
            value={activeCountries}
            icon={Globe2}
          />
          <StatCard label={t("home.statFeeds")} value={epgFeeds} icon={Server} />
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {t("home.sectionCountries")}
              </h2>
              <p className="text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionCountriesDesc")}
              </p>
            </div>
            <Link
              href="/countries"
              className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4 shrink-0"
            >
              {t("home.viewAllCountries", { count: EPG_PW_COUNTRIES.length })}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.slice(0, 20).map((c) => (
              <CountryCard key={c.code} {...c} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {t("home.sectionPlaylists")}
              </h2>
              <p className="text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionPlaylistsDesc")}
              </p>
            </div>
            <Link
              href="/playlists"
              className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4 shrink-0"
            >
              {t("home.viewAllPlaylists")}
            </Link>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[var(--muted-foreground)] max-w-xl leading-relaxed text-sm sm:text-base">
              {t("home.playlistsTeaser")}
            </p>
            <Link href="/playlists" className="w-full sm:w-auto shrink-0">
              <Button className="w-full sm:w-auto">{t("home.playlistsCta")}</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
