"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Cable,
  CheckCircle2,
  FileCode2,
  Globe2,
  Layers,
  Radio,
  Sparkles,
  Tv,
  Workflow,
} from "lucide-react";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources/constants";
import { CountryCard } from "@/components/country/CountryCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
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

const TICKER_ITEMS = [
  "XMLTV 2.0",
  "RYTEC / ENIGMA2",
  "M3U · tvg-id",
  "DE · AT · CH · UK · US",
  "KODI · VLC · JELLYFIN · PLEX",
  "SELF-HOSTED · OPEN SOURCE",
  "AUTO-REFRESH · GZIP FEEDS",
];

function SignalBar() {
  return (
    <div
      className="flex items-end gap-[3px] h-4 text-[var(--accent)]"
      aria-hidden="true"
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

function BroadcastTicker() {
  const row = (
    <div className="home-ticker-track">
      {TICKER_ITEMS.map((item, i) => (
        <span key={`${item}-${i}`} className="home-ticker-item">
          <span className="home-ticker-dot" aria-hidden="true" />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="home-ticker" aria-label="Supported formats and integrations">
      {row}
      <div aria-hidden="true">{row}</div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  detail?: string;
}) {
  return (
    <div className="surface-card relative overflow-hidden p-4 sm:p-5 flex items-start gap-3 min-w-0">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent"
        aria-hidden="true"
      />
      <span
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]"
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" aria-hidden={true} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
          {label}
        </p>
        <p className="font-serif text-2xl sm:text-[2rem] font-semibold tabular-nums leading-none text-[var(--foreground)]">
          {value}
        </p>
        {detail ? (
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{detail}</p>
        ) : null}
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
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex gap-3 min-w-0">
      <span className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-[var(--foreground)]">{label}</span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] shrink-0">
            {hint}
          </span>
        </div>
        <code className="block font-mono text-[12px] sm:text-[13px] text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-sm px-2.5 py-1.5 truncate">
          {value}
        </code>
      </div>
    </div>
  );
}

function QuickStartPanel({
  title,
  xmltvLabel,
  rytecLabel,
}: {
  title: string;
  xmltvLabel: string;
  rytecLabel: string;
}) {
  return (
    <div className="surface-card overflow-hidden h-full flex flex-col shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_8%,transparent)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]/70" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wide text-[var(--muted-foreground)] truncate">
            {title}
          </span>
        </div>
        <SignalBar />
      </div>
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        <EndpointRow icon={<FileCode2 className="h-4 w-4" />} label={xmltvLabel} value="/epg/de.xml.gz" hint="XMLTV + gzip" />
        <EndpointRow icon={<Layers className="h-4 w-4" />} label={rytecLabel} value="/rytec/rytecxmltvde.gz" hint="Enigma2 / Rytec" />
        <EndpointRow icon={<Radio className="h-4 w-4" />} label="M3U" value="/api/playlist/de.m3u" hint="tvg-id + stream URL" />
      </div>
      <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--card)]">
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0" aria-hidden="true" />
          <span>Kodi · VLC · Jellyfin · Plex · Enigma2 · IPTV Smarters</span>
        </p>
      </div>
    </div>
  );
}

function StepCard({
  index,
  title,
  description,
  icon: Icon,
}: {
  index: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="surface-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="font-mono text-xs text-[var(--accent)] font-medium">{index}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]" aria-hidden="true">
          <Icon className="h-4 w-4" aria-hidden={true} />
        </span>
      </div>
      <h3 className="font-medium text-base text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
    </div>
  );
}

function FormatCard({
  title,
  description,
  icon: Icon,
  href,
  cta,
  accent,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "surface-card p-5 flex flex-col gap-3 group transition-colors hover:border-[var(--foreground)]/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        accent && "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] hover:border-[var(--primary)]"
      )}
    >
      <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-sm border", accent ? "border-[var(--primary-foreground)]/20 bg-[var(--primary-foreground)]/10" : "border-[var(--border)] bg-[var(--surface-muted)]")} aria-hidden="true">
        <Icon className="h-4 w-4" aria-hidden={true} />
      </span>
      <div>
        <h3 className={cn("font-medium text-base", accent ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]")}>{title}</h3>
        <p className={cn("text-sm mt-1 leading-relaxed", accent ? "text-[var(--primary-foreground)]/75" : "text-[var(--muted-foreground)]")}>{description}</p>
      </div>
      <span className={cn("mt-auto inline-flex items-center gap-1 text-sm", accent ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]")}>
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
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
  const coveragePct =
    SUPPORTED_EPG_COUNTRIES.length > 0
      ? Math.round((activeCountries / SUPPORTED_EPG_COUNTRIES.length) * 100)
      : 0;

  return (
    <>
      <section className="relative border-b border-[var(--border)] overflow-hidden home-hero-glow">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.2]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 90% 75% at 20% 5%, #000 15%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 75% at 20% 5%, #000 15%, transparent 75%)",
          }}
        />
        <div className="page-shell relative pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7 home-reveal">
              <div className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--card)]/90 rounded-sm px-2.5 py-1.5 mb-5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-40 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
                </span>
                <span className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">
                  {t("home.badge")}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.55rem] xl:text-[3.85rem] font-semibold text-balance mb-5 max-w-[18ch] leading-[1.04]">
                {t("home.title")}
              </h1>
              <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-[58ch]">
                {t("home.subtitle")}
              </p>
              <div className="flex flex-col xs:flex-row flex-wrap gap-2 mb-8">
                <ButtonLink href="/countries" size="lg">{t("home.ctaCountries")}</ButtonLink>
                <ButtonLink href="/playlists" variant="outline" size="lg">{t("home.ctaPlaylists")}</ButtonLink>
                <ButtonLink href="/programmes" variant="ghost" size="lg">{t("home.ctaProgrammes")}</ButtonLink>
                <ButtonLink href="/docs" variant="ghost" size="lg">{t("home.ctaDocs")}</ButtonLink>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]">
                  <Globe2 className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                  <span className="tabular-nums">{SUPPORTED_EPG_COUNTRIES.length}</span> sources
                </span>
                <span className="text-[var(--border)]" aria-hidden="true">/</span>
                <span>{t("common.xmltv")}</span>
                <span className="text-[var(--border)]" aria-hidden="true">/</span>
                <span>{t("common.rytec")}</span>
                <span className="text-[var(--border)]" aria-hidden="true">/</span>
                <span>M3U</span>
                <span className="text-[var(--border)]" aria-hidden="true">/</span>
                <span>{coveragePct}% coverage</span>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-2 home-reveal-delay">
              <QuickStartPanel title={t("home.quickTitle")} xmltvLabel={t("common.xmltv")} rytecLabel={t("common.rytec")} />
            </div>
          </div>

          <dl className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBlock label={t("home.statChannels")} value={totalChannels.toLocaleString(numberLocale)} icon={Tv} detail="XMLTV / M3U" />
            <StatBlock label={t("home.statCountries")} value={activeCountries} icon={Globe2} detail={`${SUPPORTED_EPG_COUNTRIES.length} supported`} />
            <StatBlock label={t("home.statFeeds")} value={epgFeeds} icon={Radio} detail="gzip + Rytec" />
          </dl>
        </div>
        <BroadcastTicker />
      </section>

      <div className="page-shell py-12 sm:py-16 space-y-14 sm:space-y-20">
        <section aria-labelledby="home-how-heading">
          <div className="max-w-2xl mb-8">
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5 flex items-center gap-2">
              <Workflow className="h-3.5 w-3.5" aria-hidden="true" />
              Workflow
            </p>
            <h2 id="home-how-heading" className="section-title">{t("home.howTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">{t("home.howDesc")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StepCard index="01" icon={Globe2} title={t("home.how1Title")} description={t("home.how1Desc")} />
            <StepCard index="02" icon={Cable} title={t("home.how2Title")} description={t("home.how2Desc")} />
            <StepCard index="03" icon={Sparkles} title={t("home.how3Title")} description={t("home.how3Desc")} />
          </div>
        </section>

        <section aria-labelledby="home-formats-heading">
          <div className="max-w-2xl mb-8">
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">Output</p>
            <h2 id="home-formats-heading" className="section-title">{t("home.formatsTitle")}</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">{t("home.formatsDesc")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormatCard title={t("common.xmltv")} description="Standard EPG feeds for IPTV apps, Jellyfin, Plex, Kodi and custom players." icon={FileCode2} href="/docs/xmltv" cta={t("common.details")} />
            <FormatCard title={t("common.rytec")} description="Receiver-ready sources for Enigma2 and compatible set-top box ecosystems." icon={Layers} href="/docs/enigma2" cta={t("common.details")} />
            <FormatCard title="M3U" description="Country and worldwide playlists with tvg-id mapping to matching programme data." icon={Radio} href="/docs/m3u" cta={t("common.details")} />
            <FormatCard title={t("home.ctaCountries")} description={`${activeCountries} active / ${SUPPORTED_EPG_COUNTRIES.length} supported — browse feeds per country.`} icon={Tv} href="/countries" cta={t("common.details")} accent />
          </div>
        </section>

        <section aria-labelledby="home-countries-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">{t("common.epg")}</p>
              <h2 id="home-countries-heading" className="section-title">{t("home.sectionCountries")}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">{t("home.sectionCountriesDesc")}</p>
            </div>
            <Link href="/countries" className="link-arrow inline-flex items-center gap-1 shrink-0">
              {t("home.viewAllCountries", { count: SUPPORTED_EPG_COUNTRIES.length })}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
              <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">M3U</p>
              <h2 id="home-playlists-heading" className="section-title">{t("home.sectionPlaylists")}</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">{t("home.sectionPlaylistsDesc")}</p>
            </div>
            <Link href="/playlists" className="link-arrow inline-flex items-center gap-1 shrink-0">
              {t("home.viewAllPlaylists")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="surface-card p-5 sm:p-6 lg:col-span-2 flex flex-col justify-between gap-6 relative overflow-hidden">
              <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--accent)]/8 blur-2xl" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3 text-[var(--accent)]">
                  <Radio className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[11px] uppercase tracking-wide font-medium">Playlist catalog</span>
                </div>
                <p className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed max-w-2xl">{t("home.playlistsTeaser")}</p>
              </div>
              <div className="relative flex flex-wrap gap-2">
                <ButtonLink href="/playlists" variant="primary">{t("home.playlistsCta")}</ButtonLink>
                <ButtonLink href="/playlists/world" variant="outline">{t("world.title")}</ButtonLink>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Link href="/programmes" className="surface-card p-5 flex flex-col gap-2 hover:border-[var(--foreground)]/25 transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]">
                <CalendarDays className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
                <span className="font-medium text-sm text-[var(--foreground)]">{t("home.ctaProgrammes")}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  {t("nav.programmes")}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
              <Link href="/docs" className="surface-card p-5 flex flex-col gap-2 hover:border-[var(--foreground)]/25 transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]">
                <BookOpen className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
                <span className="font-medium text-sm text-[var(--foreground)]">{t("home.ctaDocs")}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  {t("nav.docs")}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
