import Link from "next/link";

export default function M3uDocsPage() {
  return (
    <article>
      <h1>M3U + tvg-id Anpassung</h1>
      <p>
        Lade deine M3U-Playlist hoch — FreeEPG matcht automatisch die{" "}
        <code>tvg-id</code> Attribute an unseren EPG-Katalog.
      </p>
      <h2>Schritte</h2>
      <ol>
        <li>Gehe zu <Link href="/m3u">M3U Matcher</Link></li>
        <li>Datei hochladen oder URL eingeben</li>
        <li>Matches prüfen (grün/gelb/rot)</li>
        <li>Angereicherte M3U herunterladen</li>
        <li>EPG-URL in Player eintragen</li>
      </ol>
      <h2>Output</h2>
      <pre className="font-mono text-sm bg-[var(--card)] p-4 rounded-lg">{`#EXTM3U x-tvg-url="https://free-epg.de/api/epg/m3u/abc123.xml"
#EXTINF:-1 tvg-id="ARD.de" tvg-name="Das Erste",Das Erste
http://stream-url`}</pre>
    </article>
  );
}
