import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  buildRytecXmltv,
  buildXmltv,
  isCurrentEpgOutput,
  parseXmltv,
} from "@freeepg/epg-core";
import path from "node:path";
import {
  countryGzipPath,
  countryRytecGzipPath,
  countryRytecPath,
  countryXmlPath,
  epgDataDir,
} from "./epg-paths";
import { queueCountryEpgRefresh } from "./epg-queue";

export class EpgNotReadyError extends Error {
  readonly country: string;

  constructor(country: string) {
    super(`EPG for ${country} is not ready yet`);
    this.name = "EpgNotReadyError";
    this.country = country;
  }
}

function queueRefresh(country: string): void {
  void queueCountryEpgRefresh(country).catch((err) => {
    console.warn(`[epg] failed to queue refresh for ${country}:`, err);
  });
}

async function isStaleCountryXml(country: string): Promise<boolean> {
  const filePath = countryXmlPath(country.toUpperCase());
  if (!existsSync(filePath)) return true;

  const head = await readFile(filePath, "utf-8");
  const sample = head.slice(0, 4096);
  return !isCurrentEpgOutput(sample);
}

/**
 * Returns the on-disk country XML path. Serves cached files immediately (even if
 * stale) and queues a worker refresh in the background. Never blocks on a full
 * merge in the web process.
 */
export async function ensureCountryXml(country: string): Promise<string> {
  const cc = country.toUpperCase();
  const filePath = countryXmlPath(cc);

  if (existsSync(filePath)) {
    if (await isStaleCountryXml(cc)) {
      queueRefresh(cc);
    }
    return filePath;
  }

  queueRefresh(cc);
  throw new EpgNotReadyError(cc);
}

async function writeRytecFilesFromDoc(
  country: string,
  doc: ReturnType<typeof parseXmltv>
): Promise<void> {
  const rytecXml = buildRytecXmltv(doc);
  await mkdir(epgDataDir, { recursive: true });
  await writeFile(countryRytecPath(country), rytecXml, "utf-8");
  await writeFile(
    countryRytecGzipPath(country),
    gzipSync(Buffer.from(rytecXml, "utf-8"))
  );
}

/** Ensure Rytec XML + gzip exist on disk (convert from country XML if needed). */
export async function ensureCountryRytec(country: string): Promise<void> {
  const cc = country.toUpperCase();
  const gzipPath = countryRytecGzipPath(cc);
  const xmlPath = countryRytecPath(cc);

  await ensureCountryXml(cc);

  if (existsSync(gzipPath) && existsSync(xmlPath)) return;

  const sourceXml = countryXmlPath(cc);
  if (!existsSync(sourceXml)) {
    throw new EpgNotReadyError(cc);
  }

  const xml = await readFile(sourceXml, "utf-8");
  await writeRytecFilesFromDoc(cc, parseXmltv(xml));
}

export async function readCountryRytecPayload(
  country: string,
  wantsGzip: boolean
): Promise<Buffer | string> {
  const cc = country.toUpperCase();
  await ensureCountryRytec(cc);

  if (wantsGzip) {
    const gzipPath = countryRytecGzipPath(cc);
    if (existsSync(gzipPath)) {
      return readFile(gzipPath);
    }
  }

  const xmlPath = countryRytecPath(cc);
  if (existsSync(xmlPath)) {
    const xml = await readFile(xmlPath, "utf-8");
    return wantsGzip ? gzipSync(Buffer.from(xml, "utf-8")) : xml;
  }

  const sourceXml = await readFile(countryXmlPath(cc), "utf-8");
  const rytecXml = buildRytecXmltv(parseXmltv(sourceXml));
  if (wantsGzip) {
    return gzipSync(Buffer.from(rytecXml, "utf-8"));
  }
  return rytecXml;
}

/** Parse country + format from /api/epg/rytec/{country}[.xml[.gz]] */
export function parseRytecCountryRequest(pathname: string, paramCountry: string) {
  const fromPath = pathname.match(/\/api\/epg\/rytec\/([^/]+)\/?$/)?.[1];
  const raw = decodeURIComponent(fromPath ?? paramCountry);
  const wantsGzip = /\.xml\.gz$/i.test(raw) || /\.gz$/i.test(raw);
  const country = raw.replace(/\.xml\.gz$|\.xml$|\.gz$/i, "").toUpperCase();
  return { country, wantsGzip, raw };
}

export function parseRytecChannelsRequest(pathname: string, paramCountry: string) {
  const fromPath = pathname.match(/\/api\/epg\/rytec\/channels\/([^/]+)\/?$/)?.[1];
  const raw = decodeURIComponent(fromPath ?? paramCountry);
  const country = raw.replace(/\.xml$/i, "").toUpperCase();
  return country;
}
