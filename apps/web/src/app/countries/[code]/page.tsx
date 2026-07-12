import { XmlUrlBox } from "@/components/epg/XmlUrlBox";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { eq } from "drizzle-orm";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cc = code.toUpperCase();
  const db = getDatabase();

  const countryChannels = await db
    .select()
    .from(channels)
    .where(eq(channels.country, cc))
    .limit(100);

  if (countryChannels.length === 0) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{cc}</h1>
      <p className="text-[var(--muted)] mb-8">
        {formatNumber(countryChannels.length)}+ Sender
      </p>

      <div className="mb-8">
        <XmlUrlBox
          url={`/api/epg/${code.toLowerCase()}.xml`}
          gzipUrl={`/api/epg/${code.toLowerCase()}.xml.gz`}
        />
      </div>

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
    </div>
  );
}
