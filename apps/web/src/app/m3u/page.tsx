"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function M3uUploadPage() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const upload = async (content: string, name?: string) => {
    setLoading(true);
    const res = await fetch("/api/m3u/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, name }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.id) router.push(`/m3u/${data.id}`);
  };

  const handleFile = async (file: File) => {
    const content = await file.text();
    await upload(content, file.name);
  };

  const handleUrl = async () => {
    if (!url) return;
    setLoading(true);
    const res = await fetch("/api/m3u/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.id) router.push(`/m3u/${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">M3U Matcher</h1>
      <p className="text-[var(--muted)] mb-8">
        M3U-Playlist hochladen — tvg-id wird automatisch an FreeEPG angepasst.
      </p>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center mb-6 transition-colors ${
          dragging ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <p className="mb-4">M3U-Datei hier ablegen (max. 5 MB)</p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {loading ? "Verarbeite..." : "Datei auswählen"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".m3u,.m3u8"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Oder M3U-URL eingeben..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)]"
        />
        <button
          onClick={handleUrl}
          disabled={loading || !url}
          className="px-6 py-3 rounded-lg border border-[var(--border)] disabled:opacity-50"
        >
          Importieren
        </button>
      </div>
    </div>
  );
}
