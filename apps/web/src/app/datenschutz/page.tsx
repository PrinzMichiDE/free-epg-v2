import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — FreeEPG",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf free-epg.de gemäß DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <div className="page-shell py-10 sm:py-14">
      <article className="max-w-3xl prose-docs">
        <h1>Datenschutzerklärung</h1>
        <p className="lead">
          Diese Datenschutzerklärung beschreibt, wie FreeEPG personenbezogene und
          pseudonymisierte Daten im Rahmen des Betriebs unter{" "}
          <a href="https://free-epg.de">free-epg.de</a> verarbeitet. Stand: Juli
          2026.
        </p>

        <h2>Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist der Betreiber der Instanz{" "}
          <strong>free-epg.de</strong>. Kontakt:{" "}
          <a href="mailto:admin@free-epg.de">admin@free-epg.de</a>.
        </p>

        <h2>Überblick der Verarbeitungen</h2>
        <p>
          FreeEPG ist eine Open-Source-EPG-Plattform ohne Registrierung für
          Endnutzer. Es werden keine Nutzerkonten angelegt. Die folgenden
          Verarbeitungen betreffen Website-Besucher, M3U-Uploads und den
          geschützten Admin-Bereich.
        </p>

        <h3>1. Betriebs-Analytics (Seiten &amp; API)</h3>
        <ul>
          <li>
            <strong>Zweck:</strong> Kapazitätsplanung, Fehleranalyse und
            Service-Optimierung
          </li>
          <li>
            <strong>Daten:</strong> Pseudonymisierter IP-Hash (IPv4 /24 +
            SHA-256), User-Agent, Referrer, Request-Pfad, HTTP-Methode,
            Response-Zeit
          </li>
          <li>
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse)
          </li>
          <li>
            <strong>Speicherdauer:</strong> Roh-Events 90 Tage; danach
            automatische Löschung
          </li>
          <li>
            <strong>Deaktivierung:</strong> Betreiber können Analytics mit{" "}
            <code>ANALYTICS_ENABLED=false</code> abschalten
          </li>
        </ul>

        <h3>2. M3U-Playlist-Upload</h3>
        <ul>
          <li>
            <strong>Zweck:</strong> Zuordnung von IPTV-Kanalnamen zu XMLTV-IDs
            und Erzeugung personalisierter EPG-Dateien
          </li>
          <li>
            <strong>Daten:</strong> Kanalnamen, Stream-URLs, tvg-id,
            group-title, Upload-Metadaten
          </li>
          <li>
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b bzw. lit. f
            DSGVO
          </li>
          <li>
            <strong>Speicherdauer:</strong> 30 Tage ab Upload; danach
            automatische Löschung durch einen Worker-Job
          </li>
        </ul>

        <h3>3. Admin-Authentifizierung</h3>
        <ul>
          <li>
            <strong>Zweck:</strong> Schutz des internen Admin-Dashboards
          </li>
          <li>
            <strong>Daten:</strong> Admin-E-Mail, JWT-Session; Login-Versuche
            werden IP-basiert rate-limitiert (Redis)
          </li>
          <li>
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
          </li>
          <li>
            <strong>Speicherdauer:</strong> Session-basiert; Admin-Aktionen
            werden im Audit-Log protokolliert
          </li>
        </ul>

        <h3>4. Öffentliche EPG-Metadaten</h3>
        <p>
          Sender- und Programminformationen stammen von Drittanbietern (z. B.
          iptv-org, epg.pw) und enthalten in der Regel keine personenbezogenen
          Daten der Nutzer. Sendungsbeschreibungen können Inhalte über Personen
          enthalten, die nicht von FreeEPG stammen.
        </p>

        <h2>Empfänger &amp; Drittlandtransfer</h2>
        <p>
          Es erfolgt keine Weitergabe an Dritte zu Werbe- oder Profilingzwecken.
          Bei Self-Hosting bleiben Daten auf dem Server des Betreibers. Es findet
          kein Drittlandtransfer statt, sofern der Betreiber keine externen
          Cloud-Dienste einbindet.
        </p>

        <h2>Ihre Rechte</h2>
        <p>Sie haben gegenüber dem Verantwortlichen u. a. folgende Rechte:</p>
        <ul>
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Widerspruch (Art. 21 DSGVO)</li>
          <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
        <p>
          Anfragen richten Sie bitte an{" "}
          <a href="mailto:admin@free-epg.de">admin@free-epg.de</a>.
        </p>

        <h2>Technische Schutzmaßnahmen</h2>
        <ul>
          <li>TLS-Verschlüsselung für den öffentlichen Zugriff (HTTPS)</li>
          <li>IP-Anonymisierung vor Hash-Speicherung in Analytics</li>
          <li>SSRF-Schutz beim M3U-URL-Import</li>
          <li>JWT-geschützte Admin-APIs und Rate-Limits für sensible Endpunkte</li>
        </ul>

        <h2>Weitere Informationen</h2>
        <p>
          Technische Details zur Datenverarbeitung finden sich in der internen
          Compliance-Dokumentation des Projekts. Für API- und Integrationsfragen
          siehe die <Link href="/docs">Dokumentation</Link>.
        </p>
      </article>
    </div>
  );
}
