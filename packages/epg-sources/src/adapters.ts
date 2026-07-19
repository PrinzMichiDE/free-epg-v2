import { parseXmltv, normalizeEpgPwDocument, type XmltvDocument } from "@freeepg/epg-core";
import type { EpgSourceAdapter } from "./types.js";

export class EpgPwAdapter implements EpgSourceAdapter {
  name = "epg.pw";
  type = "http";
  priority = 3;

  async fetchCountry(countryCode: string): Promise<XmltvDocument | null> {
    const cc = countryCode.toUpperCase();
    const url = `https://epg.pw/xmltv/epg_${cc}.xml`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(120_000),
        headers: { "User-Agent": "FreeEPG/1.0" },
      });
      if (!res.ok) return null;
      return normalizeEpgPwDocument(parseXmltv(await res.text()));
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
      return normalizeEpgPwDocument(parseXmltv(await res.text()));
    } catch {
      return null;
    }
  }
}

export class IptvEpgOrgAdapter implements EpgSourceAdapter {
  name = "iptv-epg.org";
  type = "http";
  priority = 4;

  async fetchCountry(countryCode: string): Promise<XmltvDocument | null> {
    const cc = countryCode.toLowerCase();
    const url = `https://iptv-epg.org/files/epg-${cc}.xml`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(180_000),
        headers: { "User-Agent": "FreeEPG/1.0" },
        redirect: "follow",
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
  priority = 2;

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

export function getDefaultAdapters(): EpgSourceAdapter[] {
  return [new IptvEpgOrgAdapter(), new EpgPwAdapter(), new XmltvSeAdapter()];
}
