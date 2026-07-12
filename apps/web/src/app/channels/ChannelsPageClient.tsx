"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";

interface Channel {
  xmltvId: string;
  name: string;
  country: string;
  hasEpg: boolean;
}

export default function ChannelsPageClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("country")?.toUpperCase() ?? "";
    if (fromUrl) setCountry(fromUrl);
  }, [searchParams]);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    const res = await fetch(`/api/channels?${params}`);
    const data = await res.json();
    setChannels(data.channels ?? []);
    setLoading(false);
  }, [q, country]);

  useEffect(() => {
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        {country && <CountryFlag code={country} size="md" />}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {country ? `Sender · ${getCountryName(country)}` : "Sender-Suche"}
          </h1>
          {country && (
            <Link
              href={`/countries/${country.toLowerCase()}`}
              className="text-sm text-[var(--primary)] hover:underline underline-offset-4 mt-1 inline-block"
            >
              Zurück zu {country}
            </Link>
          )}
        </div>
      </header>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Sender suchen..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
          autoFocus
        />
        <input
          type="text"
          placeholder="Land (DE, US...)"
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
          maxLength={2}
          className="w-24 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <a
              key={ch.xmltvId}
              href={`/channels/${encodeURIComponent(ch.xmltvId)}`}
              className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <span className="font-medium">{ch.name}</span>
                <span className="text-sm text-[var(--muted)]">{ch.country}</span>
              </div>
              <span className="text-xs font-mono text-[var(--muted)]">{ch.xmltvId}</span>
            </a>
          ))}
          {channels.length === 0 && (
            <p className="text-[var(--muted)] text-center py-8">Keine Sender gefunden</p>
          )}
        </div>
      )}
    </div>
  );
}
