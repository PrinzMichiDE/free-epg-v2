import Link from "next/link";
import { BASE_URL } from "@/lib/utils";

export default function Enigma2DocsPage() {
  return (
    <article>
      <h1>Enigma2 / Rytec (EPGImport)</h1>
      <p>
        FreeEPG erzeugt beim EPG-Update automatisch Rytec-kompatible XMLTV-Dateien
        (nach Kanal sortiert, Kategorie als Untertitel). Diese lassen sich direkt
        mit dem EPGImport-Plugin importieren.
      </p>

      <h2>Schnellstart</h2>
      <ol>
        <li>
          Plugin <strong>EPGImport</strong> installieren (OpenPLi, VTi, etc.)
        </li>
        <li>
          Datei <code>freeepg.sources.xml</code> nach{" "}
          <code>/etc/epgimport/</code> kopieren:
          <br />
          <code>{BASE_URL}/api/epg/rytec/sources</code>
        </li>
        <li>
          Gewünschte Länder-Quellen in EPGImport aktivieren (grüne Taste)
        </li>
        <li>
          Manuellen Import starten (gelbe Taste) oder täglichen Import planen
        </li>
      </ol>

      <h2>Channel-Map anpassen</h2>
      <p>
        Die mitgelieferte Channel-Map enthält alle xmltv-IDs mit Platzhalter{" "}
        <code>SERVICE_REF</code>. Ersetze diesen durch die Service-Referenz aus{" "}
        <code>/etc/enigma2/lamedb</code> für jeden Sender, den du befüllen
        willst.
      </p>
      <p>
        Beispiel für Deutschland:{" "}
        <code>{BASE_URL}/api/epg/rytec/channels/de.xml</code>
      </p>
      <p>
        Speichere die bearbeitete Datei lokal als{" "}
        <code>custom.channels.xml</code> und passe in deiner{" "}
        <code>freeepg.sources.xml</code> das <code>channels</code>-Attribut auf
        den lokalen Pfad an.
      </p>

      <h2>Direkt-URLs pro Land</h2>
      <ul>
        <li>
          Rytec EPG: <code>{BASE_URL}/api/epg/rytec/de.xml.gz</code>
        </li>
        <li>
          Standard XMLTV: <code>{BASE_URL}/api/epg/de.xml.gz</code> (Kodi, IPTV
          Apps)
        </li>
      </ul>

      <p>
        Siehe auch{" "}
        <Link href="/docs/xmltv">XMLTV Format</Link> und{" "}
        <Link href="/docs/kodi">Kodi Integration</Link>.
      </p>
    </article>
  );
}
