import { Queue } from "bullmq";
import { buildCountryRefreshJobOptions } from "@freeepg/epg-sources";

let epgQueue: Queue | null = null;

function getEpgQueue(): Queue {
  if (!epgQueue) {
    epgQueue = new Queue("epg-jobs", {
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
        maxRetriesPerRequest: 3,
      },
    });
  }
  return epgQueue;
}

/**
 * Queue a background EPG refresh for one country.
 *
 * Uses a bounded deduplication window (see `buildCountryRefreshJobOptions`)
 * instead of a persistent `jobId`, so a previously completed or failed job can
 * no longer block every future refresh for that country.
 */
export async function queueCountryEpgRefresh(
  country: string,
  opts?: { priority?: number }
): Promise<void> {
  await getEpgQueue().add(
    "fetch-country",
    { country: country.toUpperCase() },
    buildCountryRefreshJobOptions(country, opts?.priority ?? 5)
  );
}
