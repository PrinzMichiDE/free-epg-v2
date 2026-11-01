import legal from "@/config/legal.json";

export const metadata = {
  title: "Impressum | FreeEPG",
  description: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG",
};

export default function ImpressumPage() {
  const imprint = legal.imprint;
  return (
    <article className="page-shell py-10 sm:py-14 max-w-3xl">
      <h1 className="font-serif text-3xl sm:text-4xl mb-6">Impressum</h1>
      <section className="space-y-4 text-sm leading-relaxed text-[var(--foreground)]">
        <div>
          <h2 className="text-lg font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
          {imprint.name && <p>{imprint.name}</p>}
          {(imprint.street || imprint.postalCode || imprint.city) && (
            <p>
              {imprint.street}
              {imprint.street && (imprint.postalCode || imprint.city) ? <br /> : null}
              {imprint.postalCode} {imprint.city}
            </p>
          )}
          {imprint.country && <p>{imprint.country}</p>}
        </div>

        {(imprint.email || imprint.phone) && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Kontakt</h2>
            {imprint.email && <p>E-Mail: {imprint.email}</p>}
            {imprint.phone && <p>Telefon: {imprint.phone}</p>}
          </div>
        )}

        {imprint.representative && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Vertretungsberechtigt</h2>
            <p>{imprint.representative}</p>
          </div>
        )}

        {(imprint.registerNumber || imprint.registerCourt) && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Registereintrag</h2>
            {imprint.registerCourt && <p>Registergericht: {imprint.registerCourt}</p>}
            {imprint.registerNumber && <p>Registernummer: {imprint.registerNumber}</p>}
          </div>
        )}

        {imprint.vatId && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Umsatzsteuer-ID</h2>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: {imprint.vatId}</p>
          </div>
        )}

        {imprint.responsibleForContent?.name && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>{imprint.responsibleForContent.name}</p>
            {imprint.responsibleForContent.address && <p>{imprint.responsibleForContent.address}</p>}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
            oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
            Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
            verantwortlich.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
            Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
            jeweiligen Autors bzw. Erstellers.
          </p>
        </div>
      </section>
    </article>
  );
}
