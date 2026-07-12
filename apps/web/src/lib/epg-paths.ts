import path from "node:path";

export const epgDataDir =
  process.env.EPG_DATA_DIR ?? path.join(process.cwd(), "../../data/epg");

export function countryXmlPath(country: string): string {
  return path.join(epgDataDir, `${country.toLowerCase()}.xml`);
}

export function countryGzipPath(country: string): string {
  return `${countryXmlPath(country)}.gz`;
}

export function m3uXmlPath(id: string): string {
  return path.join(epgDataDir, "m3u", `${id}.xml`);
}

export function listXmlPath(id: string): string {
  return path.join(epgDataDir, "lists", `${id}.xml`);
}
