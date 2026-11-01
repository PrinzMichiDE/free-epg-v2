import legal from "@/config/legal.json";

export const metadata = {
  title: "Datenschutzerklärung | FreeEPG",
  description: "Datenschutzerklärung gemäß Art. 13 DSGVO",
};

export default function DatenschutzPage() {
  const privacy = legal.privacy;
  const takedown = legal.takedown;
  return (
    <article className="page-shell py-10 sm:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl sm:text-4xl mb-6">Datenschutzerklärung</h1>
      <section className="space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            {privacy.dataController ? <><br />{privacy.dataController}</> : null}
          </p>
          {privacy.dpoEmail && <p>Datenschutzkontakt: {privacy.dpoEmail}</p>}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Erhebung und Speicherung personenbezogener Daten</h2>
          <h3 className="font-medium mb-1">2.1 Server-Logs & Betriebs-Analytics</h3>
          <p>
            Beim Aufruf unserer Website werden durch den Server automatisch Informationen erfasst (sogenannte Server-Logfiles). Dazu gehören
            IP-Adresse, Datum und Uhrzeit, aufgerufene Seite/Datei, Referrer-URL, verwendeter Browser und Betriebssystem.
          </p>
          <p className="mt-2">
            Wir nutzen ein eigenes, anonymisiertes Analytics-System. IP-Adressen werden vor der Speicherung pseudonymisiert (gekürzter Adressbereich,
            gehasht) und nach maximal 90 Tagen gelöscht. Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betrieb,
            Sicherheit und Missbrauchserkennung).
          </p>

          <h3 className="font-medium mb-1 mt-3">2.2 M3U-Uploads</h3>
          <p>
            Wenn Sie eine M3U-Playlist hochladen, werden die darin enthaltenen Kanalinformationen (z.B. Namen, Gruppen, Stream-URLs) temporär
            gespeichert, um eine Zuordnung zu EPG-Daten durchzuführen. Diese Daten werden nach spätestens 30 Tagen automatisch gelöscht.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. f DSGVO.
          </p>

          <h3 className="font-medium mb-1 mt-3">2.3 Admin-Bereich</h3>
          <p>
            Für den administrativen Zugriff werden Anmeldedaten (E-Mail) und Sitzungsinformationen verarbeitet. Die Speicherung erfolgt nur für den
            Betrieb des geschützten Bereichs. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. Weitergabe von Daten</h2>
          <p>
            Eine Weitergabe Ihrer personenbezogenen Daten an Dritte findet nicht statt, es sei denn, wir sind gesetzlich dazu verpflichtet oder dies
            ist zur Rechtsverfolgung erforderlich.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Ihre Rechte</h2>
          <p>Sie haben nach der DSGVO folgende Rechte:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Speicherdauer</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Analytics-Rohdaten: max. 90 Tage</li>
            <li>M3U-Uploads & zugehörige Artefakte: max. 30 Tage</li>
            <li>Server-Logs: entsprechend betrieblicher Erfordernisse, in der Regel kurzfristig</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Kontakt</h2>
          <p>
            Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:
            {legal.contact.email ? <><br />{legal.contact.email}</> : null}
          </p>
        </div>
      </section>
    </article>
  );
}
