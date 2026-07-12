import Link from "next/link";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";
import { Badge } from "@/components/ui/Badge";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";

export const dynamic = "force-dynamic";

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ xmltvId: string }>;
}) {
  const { xmltvId } = await params;
  const db = getDatabase();

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.xmltvId, decodeURIComponent(xmltvId)))
    .limit(1);

  if (!channel) notFound();

  return (
    <div className="page-shell py-10 sm:py-14 max-w-4xl">
      <header className="mb-10">
        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
          Sender · {channel.country}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          {channel.name}
        </h1>
        <p className="font-mono text-sm text-[var(--muted-foreground)] mb-4">
          {channel.xmltvId}
        </p>
        {channel.hasEpg ? (
          <Badge variant="success">
            <Check className="h-3 w-3 mr-1" aria-hidden />
            EPG verfügbar
          </Badge>
        ) : (
          <Badge variant="warning">Kein EPG</Badge>
        )}
      </header>

      <EpgFeedsPanel countryCode={channel.country} />
    </div>
  );
}
