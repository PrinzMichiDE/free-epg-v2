"use client";

import { useState } from "react";

interface XmlUrlBoxProps {
  url: string;
  gzipUrl?: string;
  title?: string;
}

export function XmlUrlBox({ url, gzipUrl, title = "XMLTV Feed URL" }: XmlUrlBoxProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm font-medium mb-2">{title}</p>
      <code className="font-mono text-sm block p-3 rounded-lg bg-[var(--background)] break-all">
        {fullUrl}
      </code>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => copy(fullUrl)}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm hover:opacity-90"
        >
          {copied ? "Kopiert ✓" : "URL kopieren"}
        </button>
        <a
          href={url}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--background)]"
          download
        >
          Download XML
        </a>
        {gzipUrl && (
          <a
            href={gzipUrl}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--background)]"
          >
            .xml.gz
          </a>
        )}
      </div>
    </div>
  );
}
