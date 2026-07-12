import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  buildRytecXmltv,
  buildXmltv,
  parseXmltv,
} from "@freeepg/epg-core";
import { EpgPwAdapter } from "@freeepg/epg-sources";
import path from "node:path";
import {
  countryGzipPath,
  countryRytecGzipPath,
  countryRytecPath,
  countryXmlPath,
  epgDataDir,
} from "./epg-paths";

export async function ensureCountryXml(country: string): Promise<string> {
  const filePath = countryXmlPath(country);
  if (existsSync(filePath)) return filePath;

  const adapter = new EpgPwAdapter();
  const doc = await adapter.fetchCountry(country);
  if (!doc) throw new Error("EPG not available");

  const xml = buildXmltv(doc);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, xml, "utf-8");
  await writeFile(countryGzipPath(country), gzipSync(Buffer.from(xml, "utf-8")));

  const rytecXml = buildRytecXmltv(doc);
  await writeFile(countryRytecPath(country), rytecXml, "utf-8");
  await writeFile(
    countryRytecGzipPath(country),
    gzipSync(Buffer.from(rytecXml, "utf-8"))
  );

  return filePath;
}

export async function ensureCountryRytec(country: string): Promise<string> {
  const rytecPath = countryRytecPath(country);
  if (existsSync(rytecPath)) return rytecPath;

  await ensureCountryXml(country);
  if (existsSync(rytecPath)) return rytecPath;

  const xml = await readFile(countryXmlPath(country), "utf-8");
  const rytecXml = buildRytecXmltv(parseXmltv(xml));
  await mkdir(epgDataDir, { recursive: true });
  await writeFile(rytecPath, rytecXml, "utf-8");
  await writeFile(
    countryRytecGzipPath(country),
    gzipSync(Buffer.from(rytecXml, "utf-8"))
  );

  return rytecPath;
}
