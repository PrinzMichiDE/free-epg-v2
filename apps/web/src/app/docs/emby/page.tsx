export default function EmbyDocsPage() {
  return (
    <article>
      <h1>Emby Integration</h1>
      <p>
        Emby unterstützt XMLTV als Live-TV-EPG-Quelle. FreeEPG liefert
        XMLTV-Dateien mit deklarierten Kanälen, Start-/Stop-Zeiten und
        explizitem Zeitzonen-Offset.
      </p>

      <h2>EPG in Emby einrichten</h2>
      <ol>
        <li>Emby Server → Dashboard → Live TV</li>
        <li>EPG-Quelle hinzufügen → <strong>XMLTV</strong></li>
        <li>
          Datei/URL: <code>https://free-epg.de/api/epg/de.xml.gz</code>
        </li>
        <li>Kanäle den Tunern zuordnen (XMLTV-Kanal-ID = <code>tvg-id</code>)</li>
      </ol>

      <h2>Anforderungen (von Emby erfüllt)</h2>
      <ul>
        <li>
          Zeitformat: <code>YYYYMMDDHHMMSS +ZZZZ</code> (z. B.{" "}
          <code>20260720122000 +0200</code>)
        </li>
        <li>
          Jede <code>programme</code>-<code>channel</code>-ID existiert als{" "}
          <code>channel id</code>
        </li>
        <li>Programme mit <code>start</code> und <code>stop</code></li>
        <li>Aktuelle und zukünftige Sendezeiten (kein reines Archiv)</li>
      </ul>

      <h2>Kanal-IDs</h2>
      <p>
        Emby mappt über die XMLTV-Kanal-ID. Typische deutsche IDs:{" "}
        <code>ARD.de</code>, <code>ZDF.de</code>, <code>76748</code> (NDR/epg.pw).
        Die <code>tvg-id</code> in der M3U muss exakt passen.
      </p>

      <h2>Jellyfin</h2>
      <p>
        Jellyfin nutzt dieselbe XMLTV-Integration. Dieselbe FreeEPG-URL und
        Kanal-Zuordnung gelten auch dort.
      </p>
    </article>
  );
}
