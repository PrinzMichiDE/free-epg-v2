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

async function seed() {
  const db = getDb();

  console.log("Fetching iptv-org metadata...");
  const [channelData, countryData] = await Promise.all([
    fetchChannels(),
    fetchCountries(),
  ]);

  console.log(`Importing ${channelData.length} channels...`);
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
          name: channels.name,
          altNames: channels.altNames,
          country: channels.country,
          categories: channels.categories,
          website: channels.website,
          updatedAt: new Date(),
        },
      });
    console.log(`  ${Math.min(i + batchSize, channelData.length)}/${channelData.length}`);
  }

  console.log("Seeding EPG sources...");
  const sources = [
    { name: "epg.pw", type: "http", priority: 2, enabled: true, url: "https://epg.pw/xmltv/" },
    { name: "xmltv.se", type: "http", priority: 3, enabled: true, url: "https://xmltv.se/" },
    { name: "iptv-org/epg", type: "grabber", priority: 1, enabled: true, url: null },
  ];

  for (const src of sources) {
    await db.insert(epgSources).values(src).onConflictDoNothing();
  }

  console.log(`Seeded ${channelData.length} channels, ${countryData.length} countries`);
  await closeDb();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
