"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileCode2,
  Globe2,
  Layers,
  Radio,
  Tv,
} from "lucide-react";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources/constants";
import { CountryCard } from "@/components/country/CountryCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
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

function SignalBar() {
  return (
    <div
      className="flex items-end gap-[3px] h-4 text-[var(--accent)]"
      aria-hidden
    >
      {[40, 65, 50, 85, 100, 70, 90].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px] bg-current"
          style={{ height: `${h}%`, opacity: 0.35 + (i / 10) * 0.65 }}
        />
      ))}
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-card p-4 sm:p-5 flex items-start gap-3 min-w-0">
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]"
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-0.5">
          {label}
        </p>
        <p className="font-serif text-2xl sm:text-3xl font-semibold tabular-nums leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickStartPanel({
  xmltvLabel,
  rytecLabel,
  m3uLabel,
}: {
  xmltvLabel: string;
  rytecLabel: string;
  m3uLabel: string;
}) {
  return (
    <div className="surface-card overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]/60" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wide text-[var(--muted-foreground)] truncate">
            endpoint examples
          </span>
        </div>
        <SignalBar />
      </div>
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        <EndpointRow
          icon={<FileCode2 className="h-4 w-4" />}
          label={xmltvLabel}
          value="/epg/de.xml.gz"
          hint="XMLTV + gzip"
        />
        <EndpointRow
          icon={<Layers className="h-4 w-4" />}
          label={rytecLabel}
          value="/rytec/rytecxmltvde.gz"
          hint="Enigma2 / Rytec"
        />
        <EndpointRow
          icon={<Radio className="h-4 w-4" />}
          label={m3uLabel}
          value="/api/playlist/de.m3u"
          hint="tvg-id + stream URL"
        />
      </div>
      <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--card)]">
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          Kodi · VLC · Jellyfin · Plex · Enigma2 · IPTV Smarters
        </p>
      </div>
    </div>
  );
}

function EndpointRow({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex gap-3 min-w-0">
      <span
        className="mt-0.5 shrink-0 text-[var(--muted-foreground)]"
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-[var(--foreground)]">
            {label}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] shrink-0">
            {hint}
          </span>
        </div>
        <code className="block font-mono text-[12px] sm:text-[13px] text-[var(--foreground)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-sm px-2.5 py-1.5 truncate">
          {value}
        </code>
      </div>
    </div>
  );
}

export function HomePageContent({
  countries,
  totalChannels,
  activeCountries,
  epgFeeds,
}: HomePageContentProps) {
  const { t, locale } = useI18n();
  const numberLocale = locale === "de" ? "de-DE" : locale;
  const featuredCountries = countries
    .filter((c) => c.channelCount > 0 || c.hasEpg)
    .slice(0, 12);
  const displayCountries =
    featuredCountries.length > 0 ? featuredCountries : countries.slice(0, 12);

  return (
    <>
      <section className="relative border-b border-[var(--border)] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 15% 10%, #000 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 15% 10%, #000 20%, transparent 75%)",
          }}
        />
        <div className="page-shell relative py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--card)] rounded-sm px-2.5 py-1 mb-5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--success)]"
                  aria-hidden
                />
                <span className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">
                  {t("home.badge")}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-balance mb-5 max-w-3xl">
                {t("home.title")}
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-2xl">
                {t("home.subtitle")}
              </p>
              <div className="flex flex-col xs:flex-row flex-wrap gap-2 mb-8">
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
                <Link href="/docs">
                  <Button variant="ghost" size="lg">
                    {t("home.ctaDocs")}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5" aria-hidden />
                  {SUPPORTED_EPG_COUNTRIES.length} sources
                </span>
                <span className="text-[var(--border)]" aria-hidden>
                  /
                </span>
                <span>{t("common.xmltv")}</span>
                <span className="text-[var(--border)]" aria-hidden>
                  /
                </span>
                <span>{t("common.rytec")}</span>
                <span className="text-[var(--border)]" aria-hidden>
                  /
                </span>
                <span>M3U</span>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-2">
              <QuickStartPanel
                xmltvLabel={t("common.xmltv")}
                rytecLabel={t("common.rytec")}
                m3uLabel="M3U"
              />
            </div>
          </div>

          <dl className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBlock
              label={t("home.statChannels")}
              value={totalChannels.toLocaleString(numberLocale)}
              icon={Tv}
            />
            <StatBlock
              label={t("home.statCountries")}
              value={activeCountries}
              icon={Globe2}
            />
            <StatBlock
              label={t("home.statFeeds")}
              value={epgFeeds}
              icon={Radio}
            />
          </dl>
        </div>
      </section>

      <div className="page-shell py-12 sm:py-16 space-y-14 sm:space-y-16">
        <section aria-labelledby="home-countries-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">
                {t("common.epg")}
              </p>
              <h2 id="home-countries-heading" className="section-title">
                {t("home.sectionCountries")}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionCountriesDesc")}
              </p>
            </div>
            <Link
              href="/countries"
              className="link-arrow inline-flex items-center gap-1 shrink-0"
            >
              {t("home.viewAllCountries", {
                count: SUPPORTED_EPG_COUNTRIES.length,
              })}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayCountries.map((c) => (
              <CountryCard key={c.code} {...c} />
            ))}
          </div>
        </section>

        <section aria-labelledby="home-playlists-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">
                M3U
              </p>
              <h2 id="home-playlists-heading" className="section-title">
                {t("home.sectionPlaylists")}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">
                {t("home.sectionPlaylistsDesc")}
              </p>
            </div>
            <Link
              href="/playlists"
              className="link-arrow inline-flex items-center gap-1 shrink-0"
            >
              {t("home.viewAllPlaylists")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="surface-card p-5 sm:p-6 lg:col-span-2 flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[var(--accent)]">
                  <Radio className="h-4 w-4" aria-hidden />
                  <span className="text-[11px] uppercase tracking-wide font-medium">
                    iptv.org
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed max-w-2xl">
                  {t("home.playlistsTeaser")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/playlists">
                  <Button variant="primary">{t("home.playlistsCta")}</Button>
                </Link>
                <Link href="/playlists/world">
                  <Button variant="outline">{t("world.title")}</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Link
                href="/programmes"
                className={cn(
                  "surface-card p-5 flex flex-col gap-2 hover:border-[var(--foreground)]/25 transition-colors group"
                )}
              >
                <CalendarDays
                  className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors"
                  aria-hidden
                />
                <span className="font-medium text-sm text-[var(--foreground)]">
                  {t("home.ctaProgrammes")}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  {t("nav.programmes")}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
              <Link
                href="/docs"
                className={cn(
                  "surface-card p-5 flex flex-col gap-2 hover:border-[var(--foreground)]/25 transition-colors group"
                )}
              >
                <BookOpen
                  className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors"
                  aria-hidden
                />
                <span className="font-medium text-sm text-[var(--foreground)]">
                  {t("home.ctaDocs")}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  {t("nav.docs")}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
