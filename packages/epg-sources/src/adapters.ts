import {
  mergeXmltvDocs,
  parseXmltv,
  normalizeEpgPwDocument,
  type XmltvDocument,
} from "@freeepg/epg-core";
import type { EpgSourceAdapter } from "./types.js";
import { GLOBETV_FOLDERS_BY_COUNTRY } from "./globetv-countries.js";

const GLOBETV_RAW_BASE = "https://raw.githubusercontent.com/globetvapp/epg/main";
const FETCH_HEADERS = { "User-Agent": "FreeEPG/1.0" };

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

export class GlobetvAppAdapter implements EpgSourceAdapter {
  name = "globetv.app";
  type = "http";
  priority = 5;

  async fetchCountry(countryCode: string): Promise<XmltvDocument | null> {
    const folders = GLOBETV_FOLDERS_BY_COUNTRY[countryCode.toUpperCase()];
    if (!folders?.length) return null;

    let merged: XmltvDocument = { channels: [], programmes: [] };

    for (const folder of folders) {
      const prefix = folder.toLowerCase();
      for (let index = 1; index <= 12; index++) {
        const url = `${GLOBETV_RAW_BASE}/${folder}/${prefix}${index}.xml`;
        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(120_000),
            headers: FETCH_HEADERS,
          });
          if (!res.ok) break;
          const doc = parseXmltv(await res.text());
          if (doc.channels.length === 0 && doc.programmes.length === 0) break;
          merged = mergeXmltvDocs(doc, merged, "primary");
        } catch {
          break;
        }
      }
    }

    return merged.channels.length > 0 ? merged : null;
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
  return [
    new GlobetvAppAdapter(),
    new IptvEpgOrgAdapter(),
    new EpgPwAdapter(),
    new XmltvSeAdapter(),
  ];
}
