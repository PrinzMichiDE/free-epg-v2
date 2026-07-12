"use client";

import Link from "next/link";
import { FileCode, Satellite } from "lucide-react";
import { XmlUrlBox } from "./XmlUrlBox";

interface EpgFeedsPanelProps {
  countryCode: string;
  showEnigma2Links?: boolean;
}

export function EpgFeedsPanel({
  countryCode,
  showEnigma2Links = true,
}: EpgFeedsPanelProps) {
  const cc = countryCode.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
        <Satellite className="h-4 w-4" aria-hidden />
        Verfügbare EPG-Feeds
      </div>

      <XmlUrlBox
        title="XMLTV"
        description="Standardformat für Kodi, IPTV-Apps und PVR-Software."
        url={`/api/epg/${cc}.xml`}
        gzipUrl={`/api/epg/${cc}.xml.gz`}
      />

      <XmlUrlBox
        title="Rytec XML"
        description="Enigma2-kompatibel: nach Kanal sortiert, Kategorie als Untertitel."
        url={`/api/epg/rytec/${cc}.xml`}
        gzipUrl={`/api/epg/rytec/${cc}.xml.gz`}
      />

      {showEnigma2Links && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4 text-sm">
          <p className="font-medium text-[var(--foreground)] mb-2 inline-flex items-center gap-2">
            <FileCode className="h-4 w-4" aria-hidden />
            Enigma2 / EPGImport
          </p>
          <ul className="space-y-1.5 text-[var(--muted-foreground)]">
            <li>
              <Link href="/docs/enigma2" className="text-[var(--primary)] hover:underline underline-offset-4">
                Setup-Anleitung
              </Link>
            </li>
            <li>
              <a href={`/api/epg/rytec/channels/${cc}.xml`} className="text-[var(--primary)] hover:underline underline-offset-4">
                Channel-Map Vorlage ({cc.toUpperCase()})
              </a>
            </li>
            <li>
              <a href="/api/epg/rytec/sources" className="text-[var(--primary)] hover:underline underline-offset-4">
                sources.xml (alle Länder)
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
