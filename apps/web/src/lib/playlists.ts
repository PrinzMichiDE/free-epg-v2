import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import {
  SUPPORTED_EPG_COUNTRIES,
  IptvOrgApiAdapter,
  type IptvStream,
} from "@freeepg/epg-sources";
import { channels } from "@freeepg/db";
import {
  buildM3uPlaylist,
  pickBestStreamsPerChannel,
  qualityScore,
  type PlaylistStreamEntry,
} from "@freeepg/m3u-matcher";
import { getDatabase } from "@/lib/db";
import { BASE_URL, countryEpgPaths } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";

const STREAMS_TTL_MS = 24 * 60 * 60 * 1000;
const COUNTRIES_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface PlaylistCountry {
  code: string;
  name: string;
  streamCount: number;
  channelCount: number;
  hasEpg: boolean;
  m3uUrl: string;
  epgUrl: string;
}

export const WORLD_PLAYLIST_SLUG = "world";

export interface WorldPlaylistMeta {
  slug: typeof WORLD_PLAYLIST_SLUG;
  name: string;
  countryCount: number;
  channelCount: number;
  streamCount: number;
  entryLimit: number;
  hasEpg: boolean;
  m3uUrl: string;
  epgUrl: string;
}

const WORLD_PLAYLIST_MAX_ENTRIES = 10_000;

export { WORLD_PLAYLIST_MAX_ENTRIES };

function epgDataDir(): string {
  return process.env.EPG_DATA_DIR ?? path.join(process.cwd(), "../../data/epg");
}

function playlistsDir(): string {
  return path.join(epgDataDir(), "playlists");
}

function isFresh(filePath: string, ttlMs: number): boolean {
  if (!existsSync(filePath)) return false;
  return Date.now() - statSync(filePath).mtimeMs < ttlMs;
}

async function loadCachedStreams(): Promise<IptvStream[]> {
  const cacheFile = path.join(playlistsDir(), "streams.json");

  if (isFresh(cacheFile, STREAMS_TTL_MS)) {
    return JSON.parse(await readFile(cacheFile, "utf8")) as IptvStream[];
  }

  const api = new IptvOrgApiAdapter();
  const streams = await api.fetchStreams();
  const filtered = streams.filter((s) => s.channel && s.url);

  await mkdir(playlistsDir(), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(filtered));

  return filtered;
}

async function loadWorldCountryNames(): Promise<Record<string, string>> {
  const cacheFile = path.join(playlistsDir(), "country-names.json");

  if (isFresh(cacheFile, COUNTRIES_TTL_MS)) {
    return JSON.parse(await readFile(cacheFile, "utf8")) as Record<
      string,
      string
    >;
  }

  const api = new IptvOrgApiAdapter();
  const countries = await api.fetchCountries();
  const map = Object.fromEntries(
    countries.map((c) => [c.code.toUpperCase(), c.name])
  );

  await mkdir(playlistsDir(), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(map));

  return map;
}

async function loadChannelCountryMap(): Promise<Map<string, string>> {
  const db = getDatabase();
  const rows = await db
    .select({ xmltvId: channels.xmltvId, country: channels.country })
    .from(channels);

  return new Map(rows.map((r) => [r.xmltvId, r.country.toUpperCase()]));
}

function resolveEpgUrl(countryCode: string): string {
  const cc = countryCode.toUpperCase();
  if (SUPPORTED_EPG_COUNTRIES.includes(cc)) {
    return `${BASE_URL}${countryEpgPaths(cc).xmlUrl}`;
  }
  return `${BASE_URL}/api/epg`;
}

function playlistName(code: string, worldNames: Record<string, string>): string {
  return getCountryName(code, worldNames);
}

export async function getPlaylistCountries(): Promise<PlaylistCountry[]> {
  const [streams, channelMap, worldNames] = await Promise.all([
    loadCachedStreams(),
    loadChannelCountryMap(),
    loadWorldCountryNames(),
  ]);

  const streamCounts = new Map<string, number>();
  const channelCounts = new Map<string, Set<string>>();

  for (const stream of streams) {
    const channelId = stream.channel!;
    const country = channelMap.get(channelId);
    if (!country) continue;

    streamCounts.set(country, (streamCounts.get(country) ?? 0) + 1);

    if (!channelCounts.has(country)) {
      channelCounts.set(country, new Set());
    }
    channelCounts.get(country)!.add(channelId);
  }

  return [...streamCounts.entries()]
    .map(([code, streamCount]) => ({
      code,
      name: playlistName(code, worldNames),
      streamCount,
      channelCount: channelCounts.get(code)?.size ?? 0,
      hasEpg: SUPPORTED_EPG_COUNTRIES.includes(code),
      m3uUrl: `/api/playlists/${code.toLowerCase()}.m3u`,
      epgUrl: resolveEpgUrl(code),
    }))
    .sort((a, b) => b.streamCount - a.streamCount);
}

export async function buildCountryPlaylistM3u(
  countryCode: string
): Promise<{ content: string; entryCount: number } | null> {
  const cc = countryCode.toUpperCase();
  const [streams, channelMap, worldNames] = await Promise.all([
    loadCachedStreams(),
    loadChannelCountryMap(),
    loadWorldCountryNames(),
  ]);

  const candidates = streams
    .filter((stream) => {
      const channelId = stream.channel!;
      return channelMap.get(channelId) === cc;
    })
    .map((stream) => ({
      channelId: stream.channel!,
      title: stream.title,
      url: stream.url,
      quality: stream.quality,
    }));

  if (candidates.length === 0) {
    return null;
  }

  const picked = pickBestStreamsPerChannel(candidates);
  const countryLabel = playlistName(cc, worldNames);

  const entries: PlaylistStreamEntry[] = picked.map((stream) => ({
    tvgId: stream.channelId,
    title: stream.title,
    url: stream.url,
    groupTitle: countryLabel,
  }));

  const epgUrl = resolveEpgUrl(cc);
  const content = buildM3uPlaylist(entries, epgUrl);

  return { content, entryCount: entries.length };
}

export async function getWorldPlaylistMeta(): Promise<WorldPlaylistMeta> {
  const countries = await getPlaylistCountries();

  return {
    slug: WORLD_PLAYLIST_SLUG,
    name: "Weltweit — alle Länder",
    countryCount: countries.length,
    channelCount: countries.reduce((sum, c) => sum + c.channelCount, 0),
    streamCount: countries.reduce((sum, c) => sum + c.streamCount, 0),
    entryLimit: WORLD_PLAYLIST_MAX_ENTRIES,
    hasEpg: true,
    m3uUrl: `/api/playlists/${WORLD_PLAYLIST_SLUG}.m3u`,
    epgUrl: `${BASE_URL}/api/epg`,
  };
}

export async function buildWorldPlaylistM3u(): Promise<{
  content: string;
  entryCount: number;
  countryCount: number;
} | null> {
  const [streams, channelMap, worldNames] = await Promise.all([
    loadCachedStreams(),
    loadChannelCountryMap(),
    loadWorldCountryNames(),
  ]);

  const candidates = streams
    .filter((stream) => {
      const channelId = stream.channel!;
      return channelMap.has(channelId);
    })
    .map((stream) => ({
      channelId: stream.channel!,
      title: stream.title,
      url: stream.url,
      quality: stream.quality,
    }));

  if (candidates.length === 0) {
    return null;
  }

  const picked = pickBestStreamsPerChannel(
    candidates,
    WORLD_PLAYLIST_MAX_ENTRIES
  );

  const entries: PlaylistStreamEntry[] = picked
    .map((stream) => {
      const country = channelMap.get(stream.channelId)!;
      return {
        tvgId: stream.channelId,
        title: stream.title,
        url: stream.url,
        groupTitle: playlistName(country, worldNames),
      };
    })
    .sort(
      (a, b) =>
        (a.groupTitle ?? "").localeCompare(b.groupTitle ?? "", "de") ||
        a.title.localeCompare(b.title, "de")
    );

  const countriesUsed = new Set(
    picked.map((stream) => channelMap.get(stream.channelId)!)
  );

  const epgUrl = `${BASE_URL}/api/epg`;
  const content = buildM3uPlaylist(entries, epgUrl);

  return {
    content,
    entryCount: entries.length,
    countryCount: countriesUsed.size,
  };
}

export interface PlaylistPlayerEntry {
  id: string;
  tvgId: string;
  title: string;
  url: string;
  groupTitle?: string;
  referrer?: string;
  userAgent?: string;
}

export interface PlaylistPlayerData {
  code: string;
  name: string;
  epgUrl: string;
  m3uUrl: string;
  entries: PlaylistPlayerEntry[];
}

interface EnrichedStreamCandidate {
  channelId: string;
  title: string;
  url: string;
  quality?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}

function pickBestEnrichedStreams(
  streams: EnrichedStreamCandidate[],
  maxEntries = 3000
): EnrichedStreamCandidate[] {
  const best = new Map<string, EnrichedStreamCandidate>();

  for (const stream of streams) {
    const existing = best.get(stream.channelId);
    if (
      !existing ||
      qualityScore(stream.quality) > qualityScore(existing.quality)
    ) {
      best.set(stream.channelId, stream);
    }
  }

  return [...best.values()]
    .sort((a, b) => a.title.localeCompare(b.title, "de"))
    .slice(0, maxEntries);
}

function toPlayerEntries(
  streams: EnrichedStreamCandidate[],
  groupTitleFor?: (channelId: string) => string | undefined
): PlaylistPlayerEntry[] {
  return streams.map((stream, index) => ({
    id: `${stream.channelId}-${index}`,
    tvgId: stream.channelId,
    title: stream.title,
    url: stream.url,
    groupTitle: groupTitleFor?.(stream.channelId),
    referrer: stream.referrer ?? undefined,
    userAgent: stream.userAgent ?? undefined,
  }));
}

export async function getCountryPlaylistPlayerData(
  countryCode: string
): Promise<PlaylistPlayerData | null> {
  const cc = countryCode.toUpperCase();
  const [streams, channelMap, worldNames] = await Promise.all([
    loadCachedStreams(),
    loadChannelCountryMap(),
    loadWorldCountryNames(),
  ]);

  const candidates: EnrichedStreamCandidate[] = streams
    .filter((stream) => {
      const channelId = stream.channel!;
      return channelMap.get(channelId) === cc;
    })
    .map((stream) => ({
      channelId: stream.channel!,
      title: stream.title,
      url: stream.url,
      quality: stream.quality,
      referrer: stream.referrer,
      userAgent: stream.user_agent,
    }));

  if (candidates.length === 0) {
    return null;
  }

  const picked = pickBestEnrichedStreams(candidates);
  const countryLabel = playlistName(cc, worldNames);

  return {
    code: cc,
    name: countryLabel,
    epgUrl: resolveEpgUrl(cc),
    m3uUrl: `/api/playlists/${cc.toLowerCase()}.m3u`,
    entries: toPlayerEntries(picked, () => countryLabel),
  };
}

export async function getWorldPlaylistPlayerData(): Promise<PlaylistPlayerData | null> {
  const [streams, channelMap, worldNames] = await Promise.all([
    loadCachedStreams(),
    loadChannelCountryMap(),
    loadWorldCountryNames(),
  ]);

  const candidates: EnrichedStreamCandidate[] = streams
    .filter((stream) => channelMap.has(stream.channel!))
    .map((stream) => ({
      channelId: stream.channel!,
      title: stream.title,
      url: stream.url,
      quality: stream.quality,
      referrer: stream.referrer,
      userAgent: stream.user_agent,
    }));

  if (candidates.length === 0) {
    return null;
  }

  const picked = pickBestEnrichedStreams(candidates, WORLD_PLAYLIST_MAX_ENTRIES);
  const sorted = [...picked].sort((a, b) => {
    const countryA = playlistName(channelMap.get(a.channelId)!, worldNames);
    const countryB = playlistName(channelMap.get(b.channelId)!, worldNames);
    return (
      countryA.localeCompare(countryB, "de") ||
      a.title.localeCompare(b.title, "de")
    );
  });

  return {
    code: WORLD_PLAYLIST_SLUG,
    name: "Weltweit — alle Länder",
    epgUrl: `${BASE_URL}/api/epg`,
    m3uUrl: `/api/playlists/${WORLD_PLAYLIST_SLUG}.m3u`,
    entries: toPlayerEntries(sorted, (channelId) =>
      playlistName(channelMap.get(channelId)!, worldNames)
    ),
  };
}

export async function getPlaylistCountry(
  countryCode: string
): Promise<PlaylistCountry | null> {
  const cc = countryCode.toUpperCase();
  const countries = await getPlaylistCountries();
  return countries.find((c) => c.code === cc) ?? null;
}

