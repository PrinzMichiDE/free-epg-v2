import { XmlUrlBox } from "@/components/epg/XmlUrlBox";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { eq, sql } from "drizzle-orm";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cc = code.toUpperCase();

  if (!EPG_PW_COUNTRIES.includes(cc)) {
    notFound();
  }

  let countryChannels: (typeof channels.$inferSelect)[] = [];
  let totalCount = 0;
  let dbUnavailable = false;

  try {
    const db = getDatabase();

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(channels)
      .where(eq(channels.country, cc));

    totalCount = countRow?.count ?? 0;

    countryChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.country, cc))
      .limit(100);
  } catch {
    dbUnavailable = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{cc}</h1>
      <p className="text-[var(--muted)] mb-8">
        {dbUnavailable
          ? "Senderdaten vorübergehend nicht verfügbar"
          : `${formatNumber(totalCount)}+ Sender`}
      </p>

      <div className="space-y-6 mb-8">
        <XmlUrlBox
          title="XMLTV Feed"
          url={`/api/epg/${code.toLowerCase()}.xml`}
          gzipUrl={`/api/epg/${code.toLowerCase()}.xml.gz`}
        />
        <XmlUrlBox
          title="Rytec (Enigma2 / EPGImport)"
          url={`/api/epg/rytec/${code.toLowerCase()}.xml`}
          gzipUrl={`/api/epg/rytec/${code.toLowerCase()}.xml.gz`}
        />
        <p className="text-sm text-[var(--muted)]">
          Enigma2:{" "}
          <a href="/docs/enigma2" className="text-[var(--primary)] hover:underline">
            EPGImport-Anleitung
          </a>
          {" · "}
          <a
            href={`/api/epg/rytec/channels/${code.toLowerCase()}.xml`}
            className="text-[var(--primary)] hover:underline"
          >
            Channel-Map Vorlage
          </a>
        </p>
      </div>

      {dbUnavailable ? (
        <p className="text-[var(--muted)]">
          Die Datenbank ist gerade nicht erreichbar. Bitte in ein paar Sekunden
          erneut laden.
        </p>
      ) : countryChannels.length === 0 ? (
        <p className="text-[var(--muted)]">
          Noch keine Sender für dieses Land importiert. Der XMLTV-Feed steht
          trotzdem bereit, sobald EPG-Daten vorliegen.
        </p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Sender</h2>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">xmltv_id</th>
                  <th className="text-left p-3">EPG</th>
                </tr>
              </thead>
              <tbody>
                {countryChannels.map((ch) => (
                  <tr key={ch.id} className="border-t border-[var(--border)]">
                    <td className="p-3">
                      <a
                        href={`/channels/${encodeURIComponent(ch.xmltvId)}`}
                        className="hover:underline text-[var(--primary)]"
                      >
                        {ch.name}
                      </a>
                    </td>
                    <td className="p-3 font-mono text-xs">{ch.xmltvId}</td>
                    <td className="p-3">{ch.hasEpg ? "✓" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCount > countryChannels.length && (
            <p className="text-sm text-[var(--muted)] mt-4">
              Zeigt {countryChannels.length} von {formatNumber(totalCount)}{" "}
              Sendern.
            </p>
          )}
        </>
      )}
    </div>
  );
}
