import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import {
  getDb,
  epgJobs,
  epgSources,
  generatedFiles,
  channels,
} from "@freeepg/db";
import { buildXmltv, parseXmltv, buildRytecXmltv, rytecXmlFileName } from "@freeepg/epg-core";
import { fetchMergedCountryEpg } from "@freeepg/epg-sources";

const gzipAsync = promisify(gzip);

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

async function gzipToFile(filePath: string, data: string): Promise<void> {
  const gzipped = await gzipAsync(Buffer.from(data, "utf-8"));
  await writeFile(filePath, gzipped);
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export interface GenerateResult {
  country: string;
  channels: number;
  programmes: number;
  filePath: string;
  gzipPath: string;
  rytecPath: string;
  rytecGzipPath: string;
  checksum: string;
  size: number;
}

export class EpgGenerator {
  private epgDataDir: string;

  constructor(epgDataDir?: string) {
    this.epgDataDir = epgDataDir ?? process.env.EPG_DATA_DIR ?? path.join(process.cwd(), "../../data/epg");
  }

  async saveXml(country: string, doc: ReturnType<typeof parseXmltv>) {
    await ensureDir(this.epgDataDir);
    const cc = country.toLowerCase();

    const xml = buildXmltv(doc);
    const filePath = path.join(this.epgDataDir, `${cc}.xml`);
    const gzipPath = `${filePath}.gz`;
    await writeFile(filePath, xml, "utf-8");
    await yieldToEventLoop();
    await gzipToFile(gzipPath, xml);

    const rytecXml = buildRytecXmltv(doc);
    const rytecPath = path.join(this.epgDataDir, rytecXmlFileName(country));
    const rytecGzipPath = `${rytecPath}.gz`;
    await writeFile(rytecPath, rytecXml, "utf-8");
    await yieldToEventLoop();
    await gzipToFile(rytecGzipPath, rytecXml);

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

  async generateCountry(country: string): Promise<GenerateResult> {
    const db = getDb();
    const cc = country.toUpperCase();

    const [inserted] = await db
      .insert(epgJobs)
      .values({
        country: cc,
        jobType: "country_fetch",
        status: "running",
        startedAt: new Date(),
      })
      .returning();
    const jobRow = inserted;

    try {
      console.log(`[EPG Generator] ${country}: fetching merged sources...`);
      const result = await fetchMergedCountryEpg(country);
      if (!result) {
        throw new Error(`No EPG data for ${country}`);
      }
      const merged = result.doc;
      await yieldToEventLoop();

      console.log(`[EPG Generator] ${country}: writing XML files...`);
      const saved = await this.saveXml(country, merged);
      console.log(`[EPG Generator] ${country}: files written (${saved.size} bytes)`);

      await db
        .update(channels)
        .set({ hasEpg: true, updatedAt: new Date() })
        .where(eq(channels.country, cc));

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
        .where(eq(epgJobs.id, jobRow.id));

      for (const src of result.sources) {
        await db
          .update(epgSources)
          .set({ lastFetch: new Date(), status: "healthy", channelCount: src.channels })
          .where(eq(epgSources.name, src.name));
      }

      console.log(`[EPG Generator] ${country}: ${merged.channels.length} channels, ${merged.programmes.length} programmes`);

      return {
        country,
        channels: merged.channels.length,
        programmes: merged.programmes.length,
        ...saved,
      };
    } catch (err) {
      await db
        .update(epgJobs)
        .set({
          status: "failed",
          finishedAt: new Date(),
          error: err instanceof Error ? err.message : String(err),
        })
        .where(eq(epgJobs.id, jobRow.id));
      throw err;
    }
  }
}

export async function generateCountryEpg(country: string, epgDataDir?: string): Promise<GenerateResult> {
  const generator = new EpgGenerator(epgDataDir);
  return generator.generateCountry(country);
}
