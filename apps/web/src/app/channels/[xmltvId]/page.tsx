import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";
import { ChannelDetailView } from "@/components/channels/ChannelDetailView";

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
    <ChannelDetailView
      channel={{
        xmltvId: channel.xmltvId,
        name: channel.name,
        country: channel.country,
        hasEpg: channel.hasEpg,
        categories: channel.categories,
        website: channel.website,
        logoUrl: channel.logoUrl,
        altNames: channel.altNames,
        lang: channel.lang,
      }}
    />
  );
}
