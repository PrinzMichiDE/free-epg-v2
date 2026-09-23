import { sql, eq, lt } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, generatedFiles } from "@freeepg/db";
import { SUPPORTED_EPG_COUNTRIES } from "@freeepg/epg-sources";
import { countryEpgPaths } from "@/lib/utils";
import { queueCountryEpgRefresh } from "@/lib/epg-queue";
import { existsSync, lstatSync } from "node:fs";
import { countryXmlPath } from "@/lib/epg-paths";

const STALE_AGE_MS = 24 * 60 * 60 * 1000;

function isFileStale(filePath: string): boolean {
  if (!existsSync(filePath)) return true;
  const stats = lstatSync(filePath);
  return Date.now() - stats.mtimeMs > STALE_AGE_MS;
}

export async function GET() {
  const db = getDatabase();

  const stats = await db
    .select({
      country: channels.country,
      count: sql<number>`count(*)::int`,
    })
    .from(channels)
    .groupBy(channels.country);

  const files = await db.select().from(generatedFiles);
  const fileMap = new Map(files.map((f) => [f.country, f]));

  const now = Date.now();
  const staleCountries = new Set<string>();

  const countries = SUPPORTED_EPG_COUNTRIES.map((code) => {
    const stat = stats.find((s) => s.country === code);
    const file = fileMap.get(code);
    const paths = countryEpgPaths(code);

    let needsRefresh = false;

    if (!file) {
      needsRefresh = true;
    } else {
      const fileAge = now - file.generatedAt.getTime();
      if (fileAge > STALE_AGE_MS) {
        needsRefresh = true;
      }
    }

    const filePath = countryXmlPath(code.toUpperCase());
    if (!needsRefresh && isFileStale(filePath)) {
      needsRefresh = true;
    }

    if (needsRefresh) {
      staleCountries.add(code);
      void queueCountryEpgRefresh(code, { priority: 10 }).catch(() => {});
    }

    return {
      code,
      channelCount: stat?.count ?? 0,
      hasEpg: !!file,
      lastUpdate: file?.generatedAt ?? null,
      xmlUrl: paths.xmlUrl,
      xmlGzipUrl: paths.xmlGzipUrl,
      rytecUrl: paths.rytecUrl,
      rytecGzipUrl: paths.rytecGzipUrl,
      fileSize: file?.size ?? 0,
      needsRefresh,
    };
  }).sort((a, b) => {
    if (a.needsRefresh !== b.needsRefresh) return a.needsRefresh ? -1 : 1;
    return b.channelCount - a.channelCount;
  });

  if (staleCountries.size > 0) {
    console.log(`[countries] queued refresh for ${staleCountries.size} stale country(s)`);
  }

  const totalChannels = stats.reduce((sum, s) => sum + s.count, 0);

  return Response.json({
    countries,
    staleCount: staleCountries.size,
    stats: {
      totalChannels,
      totalCountries: countries.filter((c) => c.channelCount > 0).length,
      epgCountries: countries.filter((c) => c.hasEpg).length,
    },
  });
}
