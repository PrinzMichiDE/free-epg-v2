"use client";

import { useState, useEffect, useCallback } from "react";

interface Channel {
  xmltvId: string;
  name: string;
  country: string;
  hasEpg: boolean;
}

export default function ChannelsPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Sender-Suche</h1>
      <div className="flex gap-4 mb-8">
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
