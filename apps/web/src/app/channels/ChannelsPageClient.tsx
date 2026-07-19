"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Radio } from "lucide-react";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Channel {
  xmltvId: string;
  name: string;
  country: string;
  hasEpg: boolean;
  logoUrl: string | null;
  categories: string[] | null;
}

export default function ChannelsPageClient() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fromUrl = searchParams.get("country")?.toUpperCase() ?? "";
    if (fromUrl) setCountry(fromUrl);
  }, [searchParams]);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    params.set("page", String(page));
    const res = await fetch(`/api/channels?${params}`);
    const data = await res.json();
    setChannels(data.channels ?? []);
    setTotalPages(data.pagination?.pages ?? 1);
    setLoading(false);
  }, [q, country, page]);

  useEffect(() => {
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [q, country]);

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        {country && <CountryFlag code={country} size="md" />}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {country
              ? t("channels.titleCountry", { country: getCountryName(country) })
              : t("channels.title")}
          </h1>
          {country && (
            <Link
              href={`/countries/${country.toLowerCase()}`}
              className="text-sm text-[var(--primary)] hover:underline underline-offset-4 mt-1 inline-block"
            >
              {t("channels.backToCountry", { country })}
            </Link>
          )}
        </div>
      </header>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder={t("channels.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
          autoFocus
        />
        <input
          type="text"
          placeholder={t("channels.countryPlaceholder")}
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          maxLength={2}
          className="w-24 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] uppercase"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {channels.map((ch) => (
              <Link
                key={ch.xmltvId}
                href={`/channels/${encodeURIComponent(ch.xmltvId)}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:shadow-md transition-shadow"
              >
                {ch.logoUrl ? (
                  <img
                    src={ch.logoUrl}
                    alt=""
                    className="h-10 w-10 rounded object-contain bg-[var(--surface-muted)] shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-[var(--surface-muted)] flex items-center justify-center shrink-0">
                    <Radio className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{ch.name}</span>
                    <CountryFlag code={ch.country} size="sm" />
                    {ch.hasEpg && (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
                    )}
                  </div>
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">
                    {ch.xmltvId}
                  </span>
                  {ch.categories && ch.categories.length > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                      {ch.categories.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
            {channels.length === 0 && (
              <p className="text-[var(--muted-foreground)] text-center py-8">
                {t("channels.noResults")}
              </p>
            )}
          </div>

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
        </>
      )}
    </div>
  );
}
