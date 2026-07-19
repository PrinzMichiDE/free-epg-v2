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

/** Countries with feeds on epg.pw (subset of supported regions). */
export const EPG_PW_COUNTRIES = [
  "AU", "BR", "CA", "CN", "DE", "FR", "GB", "HK", "ID", "IN",
  "JP", "MY", "NZ", "PH", "RU", "SG", "TW", "US", "VN", "ZA",
] as const;

/** Countries with per-country XML on iptv-epg.org (see https://iptv-epg.org/). */
export const IPTV_EPG_ORG_COUNTRIES = [
  "AE", "AL", "AM", "AR", "AT", "AU", "BA", "BE", "BG", "BO", "BR", "BS", "BY",
  "CA", "CH", "CL", "CO", "CR", "CW", "CZ", "DE", "DK", "DO", "EG", "ES", "FI",
  "FR", "GB", "GE", "GH", "GR", "GT", "HN", "HK", "HR", "HU", "ID", "IL", "IN",
  "IS", "IT", "JM", "KR", "LB", "LT", "LU", "ME", "MK", "MT", "MX", "MY", "NG",
  "NI", "NL", "NO", "NZ", "PA", "PE", "PH", "PL", "PT", "PY", "RO", "RS", "RU",
  "SE", "SG", "SI", "SV", "TH", "TR", "TT", "TW", "UA", "UG", "US", "UY", "VE",
  "ZA", "ZW",
] as const;

/** All regions for which merged country EPG can be built from configured adapters. */
export const SUPPORTED_EPG_COUNTRIES = [
  ...new Set([...EPG_PW_COUNTRIES, ...IPTV_EPG_ORG_COUNTRIES]),
].sort() as string[];

export { fetchMergedCountryEpg } from "./merge.js";
export type { MergedEpgResult, MergedEpgSourceStats } from "./merge.js";
export { getPlaylistsCacheDir, refreshPlaylistCaches } from "./playlist-cache.js";
