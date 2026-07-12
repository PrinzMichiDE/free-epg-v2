import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { EpgFeedsPanel } from "@/components/epg/EpgFeedsPanel";

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{channel.name}</h1>
      <p className="font-mono text-sm text-[var(--muted)] mb-6">{channel.xmltvId}</p>
      <p className="mb-8 text-[var(--muted)]">
        {channel.country} · {channel.hasEpg ? "EPG verfügbar" : "Kein EPG"}
      </p>
      <EpgFeedsPanel countryCode={channel.country} />
    </div>
  );
}
