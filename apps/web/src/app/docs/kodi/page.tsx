import Link from "next/link";

export default function KodiDocsPage() {
  return (
    <article>
      <h1>Kodi Integration</h1>
      <ol>
        <li>Kodi → Einstellungen → PVR & Live-TV → EPG</li>
        <li>EPG-Quelle: XMLTV</li>
        <li>URL: <code>https://free-epg.de/api/epg/de.xml.gz</code></li>
        <li>Stelle sicher, dass <code>tvg-id</code> in der M3U mit FreeEPG übereinstimmen</li>
      </ol>
      <p>
        Tipp: Nutze den{" "}
        <Link href="/m3u">M3U Matcher</Link> um tvg-ids automatisch anzupassen.
      </p>
    </article>
  );
}
