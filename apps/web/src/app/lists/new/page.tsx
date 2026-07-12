"use client";

import { useState } from "react";

export default function ListBuilderPage() {
  const [name, setName] = useState("Meine Liste");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<{ xmltvId: string; name: string; country: string }>>([]);
  const [selected, setSelected] = useState<Array<{ xmltvId: string; name: string }>>([]);
  const [listUrl, setListUrl] = useState("");

  const doSearch = async () => {
    const res = await fetch(`/api/channels?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setResults(data.channels ?? []);
  };

  const addChannel = (ch: { xmltvId: string; name: string }) => {
    if (!selected.find((s) => s.xmltvId === ch.xmltvId)) {
      setSelected([...selected, ch]);
    }
  };

  const save = async () => {
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        channelIds: selected.map((s) => s.xmltvId),
      }),
    });
    const data = await res.json();
    setListUrl(data.xmlUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Custom List Builder</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] mb-6"
        placeholder="Listenname"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex gap-2 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)]"
              placeholder="Sender suchen..."
            />
            <button onClick={doSearch} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">Suchen</button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((ch) => (
              <button
                key={ch.xmltvId}
                onClick={() => addChannel(ch)}
                className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--card)]"
              >
                {ch.name} <span className="text-[var(--muted)] text-sm">({ch.country})</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Ausgewählt ({selected.length})</h2>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {selected.map((ch) => (
              <div key={ch.xmltvId} className="p-2 rounded border border-[var(--border)] text-sm">
                {ch.name}
              </div>
            ))}
          </div>
          <button
            onClick={save}
            disabled={selected.length === 0}
            className="px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-50"
          >
            Liste speichern
          </button>
          {listUrl && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <p className="text-sm font-medium mb-2">EPG URL:</p>
              <code className="font-mono text-sm break-all">{listUrl}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
