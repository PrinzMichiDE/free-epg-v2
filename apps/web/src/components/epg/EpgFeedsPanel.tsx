"use client";

import Link from "next/link";
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
      <XmlUrlBox
        title="XMLTV Feed"
        url={`/api/epg/${cc}.xml`}
        gzipUrl={`/api/epg/${cc}.xml.gz`}
      />
      <XmlUrlBox
        title="Rytec XML (Enigma2 / EPGImport)"
        url={`/api/epg/rytec/${cc}.xml`}
        gzipUrl={`/api/epg/rytec/${cc}.xml.gz`}
      />
      {showEnigma2Links && (
        <p className="text-sm text-[var(--muted)]">
          Enigma2:{" "}
          <Link href="/docs/enigma2" className="text-[var(--primary)] hover:underline">
            EPGImport-Anleitung
          </Link>
          {" · "}
          <a
            href={`/api/epg/rytec/channels/${cc}.xml`}
            className="text-[var(--primary)] hover:underline"
          >
            Channel-Map Vorlage
          </a>
          {" · "}
          <a
            href="/api/epg/rytec/sources"
            className="text-[var(--primary)] hover:underline"
          >
            sources.xml
          </a>
        </p>
      )}
    </div>
  );
}
