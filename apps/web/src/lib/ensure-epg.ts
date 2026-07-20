import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  buildRytecXmltv,
  buildXmltv,
  isCurrentEpgOutput,
  parseXmltv,
} from "@freeepg/epg-core";
import { fetchMergedCountryEpg } from "@freeepg/epg-sources";
import path from "node:path";
import {
  countryGzipPath,
  countryRytecGzipPath,
  countryRytecPath,
  countryXmlPath,
  epgDataDir,
} from "./epg-paths";

async function writeCountryEpgFiles(
  country: string,
  doc: ReturnType<typeof parseXmltv>
): Promise<string> {
  const cc = country.toUpperCase();
  const filePath = countryXmlPath(cc);
  const xml = buildXmltv(doc);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, xml, "utf-8");
  await writeFile(countryGzipPath(cc), gzipSync(Buffer.from(xml, "utf-8")));
  await writeRytecFilesFromDoc(cc, doc);

  return filePath;
}

async function isStaleCountryXml(country: string): Promise<boolean> {
  const filePath = countryXmlPath(country.toUpperCase());
  if (!existsSync(filePath)) return true;

  const head = await readFile(filePath, "utf-8");
  const sample = head.slice(0, 4096);
  return !isCurrentEpgOutput(sample);
}

export async function ensureCountryXml(country: string): Promise<string> {
  const cc = country.toUpperCase();
  const filePath = countryXmlPath(cc);
  if (existsSync(filePath) && !(await isStaleCountryXml(cc))) {
    return filePath;
  }

  const result = await fetchMergedCountryEpg(cc);
  if (!result) throw new Error("EPG not available");

  return writeCountryEpgFiles(cc, result.doc);
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
    throw new Error(`Source XML missing for ${cc}`);
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
