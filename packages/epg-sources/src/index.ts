import { parseXmltv, type XmltvDocument } from "@freeepg/epg-core";

export interface EpgSourceAdapter {
  name: string;
  type: string;
  priority: number;
  fetchCountry(countryCode: string): Promise<XmltvDocument | null>;
  fetchGlobal?(): Promise<XmltvDocument | null>;
}

export class EpgPwAdapter implements EpgSourceAdapter {
  name = "epg.pw";
  type = "http";
  priority = 2;

  async fetchCountry(countryCode: string): Promise<XmltvDocument | null> {
    const cc = countryCode.toUpperCase();
    const url = `https://epg.pw/xmltv/epg_${cc}.xml`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(120_000),
        headers: { "User-Agent": "FreeEPG/1.0" },
      });
      if (!res.ok) return null;
      return parseXmltv(await res.text());
    } catch {
      return null;
    }
  }

  async fetchGlobal(): Promise<XmltvDocument | null> {
    try {
      const res = await fetch("https://epg.pw/xmltv/epg_lite.xml", {
        signal: AbortSignal.timeout(180_000),
        headers: { "User-Agent": "FreeEPG/1.0" },
      });
      if (!res.ok) return null;
      return parseXmltv(await res.text());
    } catch {
      return null;
    }
  }
}

export class XmltvSeAdapter implements EpgSourceAdapter {
  name = "xmltv.se";
  type = "http";
  priority = 3;

  private countryUrls: Record<string, string> = {
    DE: "https://xmltv.se/almanac/DEFULL.xml",
    AT: "https://xmltv.se/almanac/ATFULL.xml",
    CH: "https://xmltv.se/almanac/CHFULL.xml",
    GB: "https://xmltv.se/almanac/GBFULL.xml",
    FR: "https://xmltv.se/almanac/FRFULL.xml",
    NL: "https://xmltv.se/almanac/NLFULL.xml",
  };

  async fetchCountry(countryCode: string): Promise<XmltvDocument | null> {
    const url = this.countryUrls[countryCode.toUpperCase()];
    if (!url) return null;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(120_000),
        headers: { "User-Agent": "FreeEPG/1.0" },
      });
      if (!res.ok) return null;
      return parseXmltv(await res.text());
    } catch {
      return null;
    }
  }
}

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

export function getDefaultAdapters(): EpgSourceAdapter[] {
  return [new EpgPwAdapter(), new XmltvSeAdapter()];
}

export const EPG_PW_COUNTRIES = [
  "AU", "BR", "CA", "CN", "DE", "FR", "GB", "HK", "ID", "IN",
  "JP", "MY", "NZ", "PH", "RU", "SG", "TW", "US", "VN", "ZA",
];

export { getPlaylistsCacheDir, refreshPlaylistCaches } from "./playlist-cache.js";
