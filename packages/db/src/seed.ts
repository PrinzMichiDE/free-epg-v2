import { sql, eq } from "drizzle-orm";
import { getDb, channels, epgSources, closeDb } from "./index.js";

interface IptvChannel {
  id: string;
  name: string;
  alt_names?: string[];
  country: string;
  categories?: string[];
  website?: string;
}

async function fetchChannels(): Promise<IptvChannel[]> {
  const res = await fetch("https://iptv-org.github.io/api/channels.json");
  if (!res.ok) throw new Error("Failed to fetch channels");
  return res.json() as Promise<IptvChannel[]>;
}

async function fetchCountries(): Promise<Array<{ code: string; name: string }>> {
  const res = await fetch("https://iptv-org.github.io/api/countries.json");
  if (!res.ok) throw new Error("Failed to fetch countries");
  return res.json() as Promise<Array<{ code: string; name: string }>>;
}

async function ensureEpgSources() {
  const db = getDb();
  const sources = [
    { name: "epg.pw", type: "http", priority: 2, enabled: true, url: "https://epg.pw/xmltv/" },
    { name: "xmltv.se", type: "http", priority: 3, enabled: true, url: "https://xmltv.se/" },
    { name: "iptv-org/epg", type: "grabber", priority: 1, enabled: true, url: null },
    { name: "iptv-org/api", type: "metadata", priority: 1, enabled: true, url: "https://iptv-org.github.io/api/" },
  ];

  for (const src of sources) {
    await db.insert(epgSources).values(src).onConflictDoNothing();
  }
}

export async function syncIptvOrgChannels(): Promise<{
  channelCount: number;
  countryCount: number;
}> {
  const db = getDb();

  console.log("[iptv-org] Fetching channel metadata...");
  const [channelData, countryData] = await Promise.all([
    fetchChannels(),
    fetchCountries(),
  ]);

  console.log(`[iptv-org] Importing ${channelData.length} channels...`);
  const batchSize = 500;
  for (let i = 0; i < channelData.length; i += batchSize) {
    const batch = channelData.slice(i, i + batchSize);
    await db
      .insert(channels)
      .values(
        batch.map((ch) => ({
          xmltvId: ch.id,
          name: ch.name,
          altNames: ch.alt_names ?? [],
          country: ch.country,
          categories: ch.categories ?? [],
          website: ch.website ?? null,
          source: "iptv-org",
          hasEpg: false,
        }))
      )
      .onConflictDoUpdate({
        target: channels.xmltvId,
        set: {
          name: sql`excluded.name`,
          altNames: sql`excluded.alt_names`,
          country: sql`excluded.country`,
          categories: sql`excluded.categories`,
          website: sql`excluded.website`,
          updatedAt: new Date(),
        },
      });
    console.log(`[iptv-org]   ${Math.min(i + batchSize, channelData.length)}/${channelData.length}`);
  }

  await ensureEpgSources();

  await db
    .update(epgSources)
    .set({
      lastFetch: new Date(),
      status: "healthy",
      channelCount: channelData.length,
    })
    .where(eq(epgSources.name, "iptv-org/api"));

  return { channelCount: channelData.length, countryCount: countryData.length };
}

export async function runSeed() {
  const result = await syncIptvOrgChannels();
  console.log(`Seeded ${result.channelCount} channels, ${result.countryCount} countries`);
  await closeDb();
}

const isDirectRun =
  typeof process.argv[1] === "string" &&
  (process.argv[1].endsWith("seed.js") || process.argv[1].endsWith("seed.ts"));

if (isDirectRun) {
  runSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
