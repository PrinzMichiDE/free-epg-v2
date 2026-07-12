"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { XmlUrlBox } from "@/components/epg/XmlUrlBox";

interface Entry {
  id: number;
  tvgName: string | null;
  tvgIdOriginal: string | null;
  tvgIdMatched: string | null;
  matchConfidence: number;
  matchMethod: string;
}

export default function M3uReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    playlist: { name: string; entryCount: number; matchedCount: number; epgUrl: string; downloadUrl: string };
    entries: Entry[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/m3u/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) {
    return <div className="max-w-7xl mx-auto px-4 py-12">Lade...</div>;
  }

  const { playlist, entries } = data;
  const matchRate = Math.round((playlist.matchedCount / playlist.entryCount) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
      <p className="text-[var(--muted)] mb-6">
        {playlist.matchedCount}/{playlist.entryCount} gematcht ({matchRate}%)
      </p>

      <div className="flex gap-4 mb-8">
        <a
          href={playlist.downloadUrl}
          className="px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"
        >
          Angereicherte M3U ↓
        </a>
      </div>

      <div className="mb-8">
        <XmlUrlBox url={playlist.epgUrl} gzipUrl={`${playlist.epgUrl}.gz`} />
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card)]">
            <tr>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">tvg-id alt</th>
              <th className="p-3 text-left">→ Neu</th>
              <th className="p-3 text-left">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-[var(--border)]">
                <td className="p-3">
                  {e.matchConfidence >= 90 ? "✓" : e.matchConfidence >= 60 ? "~" : "✗"}
                </td>
                <td className="p-3">{e.tvgName}</td>
                <td className="p-3 font-mono text-xs">{e.tvgIdOriginal || "—"}</td>
                <td className="p-3 font-mono text-xs">{e.tvgIdMatched || "—"}</td>
                <td className="p-3">{e.matchConfidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
