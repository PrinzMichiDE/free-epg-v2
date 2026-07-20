import { mergeXmltvDocs, localizeXmltvTimestamps, type XmltvDocument } from "@freeepg/epg-core";
import type { EpgSourceAdapter } from "./types.js";
import { getDefaultAdapters } from "./adapters.js";
import { applyChannelAliases } from "./channel-aliases.js";
import { getCountryOutputTimeZone } from "./country-timezones.js";

export interface MergedEpgSourceStats {
  name: string;
  channels: number;
  programmes: number;
}

export interface MergedEpgResult {
  doc: XmltvDocument;
  sources: MergedEpgSourceStats[];
}

const emptyDoc = (): XmltvDocument => ({ channels: [], programmes: [] });

/**
 * Fetches and merges XMLTV from all adapters. Lower priority numbers win conflicts
 * (processed last). Higher priority adapters provide the base layer.
 */
export async function fetchMergedCountryEpg(
  countryCode: string,
  adapters: EpgSourceAdapter[] = getDefaultAdapters()
): Promise<MergedEpgResult | null> {
  const sorted = [...adapters].sort((a, b) => a.priority - b.priority);
  let merged = emptyDoc();
  const sources: MergedEpgSourceStats[] = [];

  for (const adapter of sorted.reverse()) {
    const doc = await adapter.fetchCountry(countryCode);
    if (!doc || doc.channels.length === 0) continue;
    merged = mergeXmltvDocs(doc, merged, "primary");
    sources.push({
      name: adapter.name,
      channels: doc.channels.length,
      programmes: doc.programmes.length,
    });
  }

  if (merged.channels.length === 0) return null;

  merged = applyChannelAliases(merged);
  const timeZone = getCountryOutputTimeZone(countryCode);
  if (timeZone) {
    merged = localizeXmltvTimestamps(merged, timeZone);
  }

  return { doc: merged, sources };
}
