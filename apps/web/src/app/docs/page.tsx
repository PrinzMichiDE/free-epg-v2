export default function DocsPage() {
  return (
    <article>
      <h1>Dokumentation</h1>
      <p>
        FreeEPG stellt weltweite EPG-Daten im XMLTV-Format bereit. Diese
        Dokumentation erklärt Integration in IPTV-Player und die API-Nutzung.
      </p>
      <h2>Schnellstart</h2>
      <ol>
        <li>Land wählen auf der Startseite</li>
        <li>XML-URL kopieren (z.B. <code>/api/epg/de.xml</code>)</li>
        <li>URL in IPTV-Player als EPG-Quelle eintragen</li>
      </ol>
      <h2>Endpunkte</h2>
      <ul>
        <li><code>GET /api/epg/de.xml</code> — EPG für Deutschland</li>
        <li><code>GET /api/epg/de.xml.gz</code> — gzip-komprimiert</li>
        <li><code>GET /api/epg.xml</code> — Global Lite Feed</li>
        <li><code>POST /api/m3u/upload</code> — M3U hochladen & matchen</li>
      </ul>
    </article>
  );
}
