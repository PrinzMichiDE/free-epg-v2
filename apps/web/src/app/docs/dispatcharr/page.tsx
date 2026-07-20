export default function DispatcharrDocsPage() {
  return (
    <article>
      <h1>Dispatcharr Integration</h1>
      <p>
        Dispatcharr erwartet Standard-XMLTV mit <code>channel</code>- und{" "}
        <code>programme</code>-Elementen. FreeEPG liefert kompatible Dateien
        mit korrekten Zeitstempeln und Kanal-IDs.
      </p>

      <h2>EPG-Quelle hinzufügen</h2>
      <ol>
        <li>Dispatcharr → EPG → <strong>Add EPG</strong></li>
        <li>Source Type: <strong>XMLTV</strong></li>
        <li>
          URL: <code>https://free-epg.de/api/epg/de.xml.gz</code> (oder anderes
          Land, z. B. <code>at.xml.gz</code>)
        </li>
        <li>Name: z. B. <code>FreeEPG DE</code></li>
      </ol>

      <h2>Kanal-Zuordnung</h2>
      <p>
        Die <code>channel</code>-ID im XMLTV muss mit der <code>tvg-id</code>{" "}
        in der M3U übereinstimmen. Für NDR nutzen viele Playlists die epg.pw-ID{" "}
        <code>76748</code> — diese ist im FreeEPG-Feed enthalten.
      </p>
      <p>
        Alternativ iptv-org-IDs wie <code>NDRFernsehen.de</code> oder{" "}
        <code>ARD.de</code>. Prüfe die <code>tvg-id</code> in deiner M3U und
        wähle im Dispatcharr-EPG-Manager den passenden Kanal.
      </p>

      <h2>Zeitformat</h2>
      <p>
        FreeEPG schreibt deutsche Feeds in lokaler Wandzeit mit Offset, z. B.{" "}
        <code>20260720122000 +0200</code> (MESZ). Das entspricht dem XMLTV-Standard
        und wird von Dispatcharr korrekt geparst.
      </p>

      <h2>Tipps bei Problemen</h2>
      <ul>
        <li>Gzip-URL (<code>.xml.gz</code>) bevorzugen — kleinerer Download</li>
        <li>EPG nach FreeEPG-Updates neu laden (Cache: 1 Stunde)</li>
        <li>
          <code>tvg-id</code> exakt vergleichen (Groß-/Kleinschreibung, Punkte)
        </li>
      </ul>
    </article>
  );
}
