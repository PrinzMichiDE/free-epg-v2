import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { Worker, Queue } from "bullmq";
import cron from "node-cron";
import { eq, and, gt, inArray } from "drizzle-orm";
import {
  getDb,
  epgJobs,
  epgSources,
  generatedFiles,
  channels,
  programmes,
} from "@freeepg/db";
import { buildXmltv, parseXmltv, buildRytecXmltv, rytecXmlFileName, parseXmltvDateString } from "@freeepg/epg-core";
import {
  SUPPORTED_EPG_COUNTRIES,
  fetchMergedCountryEpg,
  refreshPlaylistCaches,
} from "@freeepg/epg-sources";
import { syncIptvOrgChannels } from "@freeepg/db/seed";
import { AnalyticsTracker } from "@freeepg/analytics";

import { Redis } from "ioredis";
import { runDockerInit } from "@freeepg/db/init";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const redisClient = new Redis(redisUrl);

const epgDataDir = process.env.EPG_DATA_DIR ?? path.join(process.cwd(), "../../data/epg");

const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null as null,
};

const epgQueue = new Queue("epg-jobs", { connection });
const analytics = new AnalyticsTracker(redisUrl);

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function saveXml(country: string, doc: ReturnType<typeof parseXmltv>) {
  await ensureDir(epgDataDir);
  const cc = country.toLowerCase();

  const xml = buildXmltv(doc);
  const filePath = path.join(epgDataDir, `${cc}.xml`);
  const gzipPath = `${filePath}.gz`;
  await writeFile(filePath, xml, "utf-8");
  const gzipped = gzipSync(Buffer.from(xml, "utf-8"));
  await writeFile(gzipPath, gzipped);

  const rytecXml = buildRytecXmltv(doc);
  const rytecPath = path.join(epgDataDir, rytecXmlFileName(country));
  const rytecGzipPath = `${rytecPath}.gz`;
  await writeFile(rytecPath, rytecXml, "utf-8");
  await writeFile(rytecGzipPath, gzipSync(Buffer.from(rytecXml, "utf-8")));

  const checksum = createHash("md5").update(xml).digest("hex");
  const db = getDb();
  await db.insert(generatedFiles).values({
    country: country.toUpperCase(),
    path: filePath,
    gzipPath,
    size: Buffer.byteLength(xml),
    checksum,
  });

  return {
    filePath,
    gzipPath,
    rytecPath,
    rytecGzipPath,
    checksum,
    size: Buffer.byteLength(xml),
  };
}

async function fetchCountryEpg(country: string) {
  const db = getDb();
  const [job] = await db
    .insert(epgJobs)
    .values({
      country: country.toUpperCase(),
      jobType: "country_fetch",
      status: "running",
      startedAt: new Date(),
    })
    .returning();

  try {
    const result = await fetchMergedCountryEpg(country);
    if (!result) {
      throw new Error(`No EPG data for ${country}`);
    }
    const merged = result.doc;

    const saved = await saveXml(country, merged);
    const previewXml = buildXmltv(merged);
    await storeProgrammePreview(country, previewXml);

    const channelIds = new Set(merged.channels.map((c) => c.id));
    await db
      .update(channels)
      .set({ hasEpg: true, updatedAt: new Date() })
      .where(eq(channels.country, country.toUpperCase()));

    await db
      .update(epgJobs)
      .set({
        status: "completed",
        finishedAt: new Date(),
        metadata: {
          channels: merged.channels.length,
          programmes: merged.programmes.length,
          sources: result.sources,
          ...saved,
        },
      })
      .where(eq(epgJobs.id, job.id));

    for (const src of result.sources) {
      await db
        .update(epgSources)
        .set({ lastFetch: new Date(), status: "healthy", channelCount: src.channels })
        .where(eq(epgSources.name, src.name));
    }

    await redisClient.del(`freeepg:meta:${country.toUpperCase()}`);
    console.log(`[EPG] ${country}: ${merged.channels.length} channels, ${merged.programmes.length} programmes`);
  } catch (err) {
    await db
      .update(epgJobs)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      })
      .where(eq(epgJobs.id, job.id));
    throw err;
  }
}

async function storeProgrammePreview(country: string, xml: string) {
  const doc = parseXmltv(xml);
  const db = getDb();
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const cc = country.toUpperCase();

  const countryChannels = await db
    .select({ id: channels.id, xmltvId: channels.xmltvId })
    .from(channels)
    .where(eq(channels.country, cc));

  const chMap = new Map(countryChannels.map((c) => [c.xmltvId, c.id]));
  const channelIds = countryChannels.map((c) => c.id);

  if (channelIds.length > 0) {
    await db
      .delete(programmes)
      .where(and(inArray(programmes.channelId, channelIds), gt(programmes.stop, now)));
  }

  const batch: Array<{
    channelId: number;
    start: Date;
    stop: Date;
    title: string;
    description: string | null;
    category: string | null;
    source: string;
  }> = [];

  for (const prog of doc.programmes) {
    const channelId = chMap.get(prog.channel);
    if (!channelId) continue;
    const start = parseXmltvDate(prog.start);
    const stop = parseXmltvDate(prog.stop);
    if (!start || !stop || start > tomorrow) continue;
    batch.push({
      channelId,
      start,
      stop,
      title: prog.title,
      description: prog.desc ?? null,
      category: prog.category ?? null,
      source: "merged",
    });
  }

  const chunkSize = 200;
  for (let i = 0; i < batch.length; i += chunkSize) {
    await db.insert(programmes).values(batch.slice(i, i + chunkSize));
  }

  console.log(`[EPG] ${cc}: stored ${batch.length} programme previews`);
}

function parseXmltvDate(s: string): Date | null {
  return parseXmltvDateString(s);
}

async function runIptvOrgGrab() {
  const db = getDb();
  const [job] = await db
    .insert(epgJobs)
    .values({
      jobType: "iptv_org_grab",
      status: "running",
      startedAt: new Date(),
    })
    .returning();

  try {
    const channelResult = await syncIptvOrgChannels();
    const cacheResult = await refreshPlaylistCaches(epgDataDir);

    await db
      .update(epgJobs)
      .set({
        status: "completed",
        finishedAt: new Date(),
        metadata: { ...channelResult, ...cacheResult },
      })
      .where(eq(epgJobs.id, job.id));

    console.log(
      `[iptv-org] Sync complete: ${channelResult.channelCount} channels, ${cacheResult.streamCount} streams`
    );
  } catch (err) {
    await db
      .update(epgJobs)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      })
      .where(eq(epgJobs.id, job.id));
    throw err;
  }
}

async function main() {
  await runDockerInit();

  console.log("FreeEPG worker started");
  console.log(`EPG data dir: ${epgDataDir}`);

const worker = new Worker(
  "epg-jobs",
  async (job) => {
    switch (job.name) {
      case "fetch-country":
        await fetchCountryEpg(job.data.country as string);
        break;
      case "fetch-all-countries":
        for (const cc of SUPPORTED_EPG_COUNTRIES) {
          await epgQueue.add("fetch-country", { country: cc }, { attempts: 2 });
        }
        break;
      case "analytics-flush":
        await analytics.flushToDb();
        break;
      case "analytics-aggregate": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await analytics.aggregateDaily(yesterday.toISOString().slice(0, 10));
        break;
      }
      case "analytics-cleanup":
        await analytics.cleanupOldEvents(90);
        break;
      case "iptv-org-grab":
        await runIptvOrgGrab();
        break;
      default:
        console.warn(`Unknown job: ${job.name}`);
    }
  },
  { connection, concurrency: 3 }
);

worker.on("completed", (job) => console.log(`Job ${job.name} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job?.name} failed:`, err));

cron.schedule(process.env.CRON_COUNTRY_FETCH ?? "0 */6 * * *", () => {
  epgQueue.add("fetch-all-countries", {}, { attempts: 1 });
});

cron.schedule("*/30 * * * * *", () => {
  epgQueue.add("analytics-flush", {}, { removeOnComplete: true });
});

cron.schedule(process.env.CRON_ANALYTICS_AGG ?? "0 2 * * *", () => {
  epgQueue.add("analytics-aggregate", {}, { attempts: 1 });
});

cron.schedule(process.env.CRON_ANALYTICS_CLEANUP ?? "0 3 * * 0", () => {
  epgQueue.add("analytics-cleanup", {}, { attempts: 1 });
});

cron.schedule(process.env.CRON_IPTV_ORG_GRAB ?? "0 2 * * *", () => {
  epgQueue.add("iptv-org-grab", {}, { attempts: 2 });
});

if (process.env.FETCH_ON_START === "true") {
  epgQueue.add("fetch-all-countries", {}, { attempts: 1 });
}
}

main().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});

export { epgQueue, saveXml, epgDataDir };
