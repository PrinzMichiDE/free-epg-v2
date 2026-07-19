"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Radio, Search } from "lucide-react";
import { CountryFlag } from "@/components/country/CountryFlag";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { ProgrammeSearchResult } from "@/lib/programmes";

type WhenFilter = "now" | "upcoming" | "all";

function formatTimeRange(start: string, stop: string, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(stop))}`;
}

function programmeProgress(start: string, stop: string): number {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(stop).getTime();
  if (e <= s) return 0;
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
}

export function ProgrammesPageClient() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const intlLocale = locale === "de" ? "de-DE" : locale;

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [country, setCountry] = useState(
    searchParams.get("country")?.toUpperCase() ?? ""
  );
  const [when, setWhen] = useState<WhenFilter>(
    (searchParams.get("when") as WhenFilter) ?? "now"
  );
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ProgrammeSearchResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (country) params.set("country", country);
    params.set("when", when);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/programmes?${params}`);
      const data = await res.json();
      setResults(data.programmes ?? []);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch {
      setResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [q, country, when, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const filters: { value: WhenFilter; label: string }[] = [
    { value: "now", label: t("programmes.filterNow") },
    { value: "upcoming", label: t("programmes.filterUpcoming") },
    { value: "all", label: t("programmes.filterAll") },
  ];

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-medium text-[var(--accent)] mb-2 inline-flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden />
          {t("programmes.badge")}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {t("programmes.title")}
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-2xl">
          {t("programmes.subtitle")}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <label className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={t("programmes.searchPlaceholder")}
            className="w-full h-11 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
            autoFocus
          />
        </label>
        <input
          type="text"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value.toUpperCase());
            setPage(1);
          }}
          placeholder={t("programmes.countryFilter")}
          maxLength={2}
          className="w-full lg:w-28 h-11 px-3 rounded-lg border border-[var(--border)] bg-[var(--card)] uppercase"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setWhen(filter.value);
              setPage(1);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px]",
              when === filter.value
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-center text-[var(--muted-foreground)] py-12">
          {t("programmes.noResults")}
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((prog) => {
            const isNow =
              new Date(prog.start) <= new Date() && new Date(prog.stop) > new Date();
            return (
              <article
                key={prog.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {isNow && (
                        <Badge variant="success">{t("programmes.live")}</Badge>
                      )}
                      {prog.category && (
                        <Badge variant="muted">{prog.category}</Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{prog.title}</h2>
                    <p className="text-sm text-[var(--muted-foreground)] tabular-nums mt-1">
                      {formatTimeRange(prog.start, prog.stop, intlLocale)}
                    </p>
                  </div>
                  <Link
                    href={`/channels/${encodeURIComponent(prog.channel.xmltvId)}`}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline shrink-0"
                  >
                    {prog.channel.logoUrl ? (
                      <img
                        src={prog.channel.logoUrl}
                        alt=""
                        className="h-8 w-8 rounded object-contain bg-[var(--surface-muted)]"
                      />
                    ) : (
                      <Radio className="h-4 w-4" aria-hidden />
                    )}
                    <span className="flex items-center gap-1.5">
                      <CountryFlag code={prog.channel.country} size="sm" />
                      {prog.channel.name}
                    </span>
                  </Link>
                </div>
                {prog.description && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>
                )}
                {isNow && (
                  <div className="mt-3 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${programmeProgress(prog.start, prog.stop)}%` }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-8 gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm disabled:opacity-40"
          >
            {t("channels.prev")}
          </button>
          <span className="text-sm text-[var(--muted-foreground)] tabular-nums">
            {t("channels.pageInfo", { page, pages: totalPages })}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm disabled:opacity-40"
          >
            {t("channels.next")}
          </button>
        </nav>
      )}
    </div>
  );
}
