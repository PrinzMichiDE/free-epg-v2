"use client";

import { useState } from "react";
import { cn, formatNumber, formatDate } from "@/lib/utils";

interface CountryCardProps {
  code: string;
  channelCount: number;
  hasEpg: boolean;
  lastUpdate: string | null;
  xmlUrl: string;
  rytecGzipUrl: string;
}

export function CountryCard({
  code,
  channelCount,
  hasEpg,
  lastUpdate,
  xmlUrl,
  rytecGzipUrl,
}: CountryCardProps) {
  const [copied, setCopied] = useState<"xmltv" | "rytec" | null>(null);

  const copyUrl = async (path: string, kind: "xmltv" | "rytec") => {
    const full = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(full);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const xmlGzipUrl = xmlUrl.endsWith(".xml") ? `${xmlUrl}.gz` : xmlUrl;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{flagEmoji(code)}</span>
        <div>
          <h3 className="font-semibold text-lg">{code}</h3>
          <p className="text-sm text-[var(--muted)]">
            {formatNumber(channelCount)} Sender
          </p>
        </div>
        <span
          className={cn(
            "ml-auto text-xs px-2 py-1 rounded-full",
            hasEpg
              ? "bg-teal-500/10 text-teal-600"
              : "bg-yellow-500/10 text-yellow-600"
          )}
        >
          {hasEpg ? "EPG ✓" : "Pending"}
        </span>
      </div>
      {lastUpdate && (
        <p className="text-xs text-[var(--muted)] mb-3">
          Update: {formatDate(lastUpdate)}
        </p>
      )}
      <div className="flex gap-2">
        <a
          href={`/countries/${code.toLowerCase()}`}
          className="flex-1 text-center text-sm py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
        >
          Details
        </a>
        <button
          type="button"
          onClick={() => copyUrl(xmlGzipUrl, "xmltv")}
          className="flex-1 text-sm py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          {copied === "xmltv" ? "Kopiert ✓" : "XMLTV"}
        </button>
        <button
          type="button"
          onClick={() => copyUrl(rytecGzipUrl, "rytec")}
          className="flex-1 text-sm py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
          title="Rytec XML für Enigma2 / EPGImport"
        >
          {copied === "rytec" ? "Kopiert ✓" : "Rytec"}
        </button>
      </div>
    </div>
  );
}

function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) =>
      String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
    );
}
