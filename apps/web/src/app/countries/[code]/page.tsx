import Link from "next/link";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { Badge } from "@/components/ui/Badge";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { eq, sql } from "drizzle-orm";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

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
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] font-mono text-base font-semibold text-[var(--primary)]">
            {cc}
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{cc}</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              {dbUnavailable
                ? "Senderdaten vorübergehend nicht verfügbar"
                : `${formatNumber(totalCount)} Sender in der Datenbank`}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
        <div className="lg:col-span-2">
          <EpgFeedsPanel countryCode={code} />
        </div>

        <div className="lg:col-span-3">
          {dbUnavailable ? (
            <p className="text-[var(--muted-foreground)]">
              Die Datenbank ist gerade nicht erreichbar. Bitte in ein paar Sekunden
              erneut laden.
            </p>
          ) : countryChannels.length === 0 ? (
            <div className="surface-card p-6">
              <p className="text-[var(--muted-foreground)]">
                Noch keine Sender für dieses Land importiert. Der XMLTV- und
                Rytec-Feed steht trotzdem bereit, sobald EPG-Daten vorliegen.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Sender</h2>
                {totalCount > countryChannels.length && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {countryChannels.length} von {formatNumber(totalCount)}
                  </p>
                )}
              </div>
              <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/60">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">xmltv_id</th>
                        <th className="text-left p-3 font-medium">EPG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countryChannels.map((ch) => (
                        <tr
                          key={ch.id}
                          className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]/40 transition-colors"
                        >
                          <td className="p-3">
                            <Link
                              href={`/channels/${encodeURIComponent(ch.xmltvId)}`}
                              className="font-medium text-[var(--primary)] hover:underline underline-offset-4"
                            >
                              {ch.name}
                            </Link>
                          </td>
                          <td className="p-3 font-mono text-xs text-[var(--muted-foreground)]">
                            {ch.xmltvId}
                          </td>
                          <td className="p-3">
                            {ch.hasEpg ? (
                              <Badge variant="success">
                                <Check className="h-3 w-3 mr-1" aria-hidden />
                                Ja
                              </Badge>
                            ) : (
                              <Badge variant="muted">—</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
