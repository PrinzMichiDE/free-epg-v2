import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { IptvOrgApiAdapter } from "./index.js";

export function getPlaylistsCacheDir(epgDataDir: string): string {
  return path.join(epgDataDir, "playlists");
}

export async function refreshPlaylistCaches(epgDataDir: string): Promise<{
  streamCount: number;
  countryCount: number;
}> {
  const api = new IptvOrgApiAdapter();
  const cacheDir = getPlaylistsCacheDir(epgDataDir);
  await mkdir(cacheDir, { recursive: true });

  const [streams, countries] = await Promise.all([
    api.fetchStreams(),
    api.fetchCountries(),
  ]);

  const filtered = streams.filter((stream) => stream.channel && stream.url);
  const countryNames = Object.fromEntries(
    countries.map((country) => [country.code.toUpperCase(), country.name])
  );

  await Promise.all([
    writeFile(path.join(cacheDir, "streams.json"), JSON.stringify(filtered)),
    writeFile(path.join(cacheDir, "country-names.json"), JSON.stringify(countryNames)),
  ]);

  return { streamCount: filtered.length, countryCount: countries.length };
}
