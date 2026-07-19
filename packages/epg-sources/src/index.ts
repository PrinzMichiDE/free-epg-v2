export type { EpgSourceAdapter } from "./types.js";
export {
  EpgPwAdapter,
  IptvEpgOrgAdapter,
  XmltvSeAdapter,
  getDefaultAdapters,
} from "./adapters.js";

export class IptvOrgApiAdapter {
  name = "iptv-org/api";
  type = "metadata";

  async fetchChannels(): Promise<
    Array<{
      id: string;
      name: string;
      alt_names?: string[];
      country: string;
      categories?: string[];
      website?: string;
    }>
  > {
    const res = await fetch("https://iptv-org.github.io/api/channels.json", {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error("Failed to fetch iptv-org channels");
    return res.json() as Promise<
      Array<{
        id: string;
        name: string;
        alt_names?: string[];
        country: string;
        categories?: string[];
        website?: string;
      }>
    >;
  }

  async fetchCountries(): Promise<
    Array<{ name: string; code: string; languages?: string[]; flag?: string }>
  > {
    const res = await fetch("https://iptv-org.github.io/api/countries.json", {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error("Failed to fetch iptv-org countries");
    return res.json() as Promise<
      Array<{ name: string; code: string; languages?: string[]; flag?: string }>
    >;
  }

  async fetchGuides(): Promise<
    Array<{ channel: string; site: string; site_id: string; lang?: string }>
  > {
    const res = await fetch("https://iptv-org.github.io/api/guides.json", {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error("Failed to fetch iptv-org guides");
    return res.json() as Promise<
      Array<{ channel: string; site: string; site_id: string; lang?: string }>
    >;
  }

  async fetchStreams(): Promise<IptvStream[]> {
    const res = await fetch("https://iptv-org.github.io/api/streams.json", {
      signal: AbortSignal.timeout(180_000),
      headers: { "User-Agent": "FreeEPG/1.0" },
    });
    if (!res.ok) throw new Error("Failed to fetch iptv-org streams");
    return res.json() as Promise<IptvStream[]>;
  }
}

export interface IptvStream {
  channel: string | null;
  feed?: string | null;
  title: string;
  url: string;
  referrer?: string | null;
  user_agent?: string | null;
  quality?: string | null;
  label?: string | null;
}

export {
  EPG_PW_COUNTRIES,
  IPTV_EPG_ORG_COUNTRIES,
  SUPPORTED_EPG_COUNTRIES,
} from "./constants.js";

export { fetchMergedCountryEpg } from "./merge.js";
export type { MergedEpgResult, MergedEpgSourceStats } from "./merge.js";
export { getPlaylistsCacheDir, refreshPlaylistCaches } from "./playlist-cache.js";
