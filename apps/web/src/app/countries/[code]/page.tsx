import Link from "next/link";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { Badge } from "@/components/ui/Badge";
import { CountryFlag } from "@/components/country/CountryFlag";
import { getCountryName } from "@/lib/countries";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { EPG_PW_COUNTRIES } from "@freeepg/epg-sources";
import { eq, sql } from "drizzle-orm";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function CountryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { code } = await params;
  const { page: pageParam } = await searchParams;
  const cc = code.toUpperCase();

  if (!EPG_PW_COUNTRIES.includes(cc)) {
    notFound();
  }

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

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
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * PAGE_SIZE;

    countryChannels = await db
      .select()
      .from(channels)
      .where(eq(channels.country, cc))
      .orderBy(channels.name)
      .limit(PAGE_SIZE)
      .offset(offset);
  } catch {
    dbUnavailable = true;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageBase = `/countries/${code.toLowerCase()}`;

  return (
    <div className="page-shell py-10 sm:py-14">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <CountryFlag code={cc} size="lg" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {getCountryName(cc)}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 font-mono text-sm">
              {cc}
              {dbUnavailable
                ? " · Senderdaten vorübergehend nicht verfügbar"
                : ` · ${formatNumber(totalCount)} Sender`}
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
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
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold tracking-tight">Sender</h2>
                <Link
                  href={`/channels?country=${cc}`}
                  className="text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4"
                >
                  Alle durchsuchen
                </Link>
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

              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-between gap-4 mt-6"
                  aria-label="Sender-Seiten"
                >
                  <p className="text-sm text-[var(--muted-foreground)] tabular-nums">
                    Seite {safePage} von {totalPages} · {formatNumber(totalCount)} Sender
                  </p>
                  <div className="flex gap-2">
                    {safePage > 1 ? (
                      <Link
                        href={safePage === 2 ? pageBase : `${pageBase}?page=${safePage - 1}`}
                        className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--surface-muted)] transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        Zurück
                      </Link>
                    ) : (
                      <span className="inline-flex items-center h-9 px-3 text-sm text-[var(--muted-foreground)] opacity-50">
                        Zurück
                      </span>
                    )}
                    {safePage < totalPages ? (
                      <Link
                        href={`${pageBase}?page=${safePage + 1}`}
                        className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--surface-muted)] transition-colors"
                      >
                        Weiter
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
