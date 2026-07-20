import { Queue } from "bullmq";

let epgQueue: Queue | null = null;

function getEpgQueue(): Queue {
  if (!epgQueue) {
    epgQueue = new Queue("epg-jobs", {
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
        maxRetriesPerRequest: null,
      },
    });
  }
  return epgQueue;
}

/** Queue a background EPG refresh for one country (deduplicated per country). */
export async function queueCountryEpgRefresh(country: string): Promise<void> {
  const cc = country.toUpperCase();
  await getEpgQueue().add(
    "fetch-country",
    { country: cc },
    {
      jobId: `refresh-${cc}`,
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: 50,
    }
  );
}
