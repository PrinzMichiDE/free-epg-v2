import { XMLBuilder } from "fast-xml-parser";
import type { XmltvChannel, XmltvDocument, XmltvProgramme } from "./matcher.js";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  suppressEmptyNode: true,
});

/** Rytec/Enigma2 uses UK instead of GB in file names. */
export function rytecCountryCode(country: string): string {
  const cc = country.toUpperCase();
  return cc === "GB" ? "UK" : cc;
}

/** e.g. rytecDE_Basic — matches common Rytec EPGImport naming. */
export function rytecBaseName(country: string): string {
  return `rytec${rytecCountryCode(country)}_Basic`;
}

export function rytecXmlFileName(country: string): string {
  return `${rytecBaseName(country)}.xml`;
}

export function rytecGzipFileName(country: string): string {
  return `${rytecXmlFileName(country)}.gz`;
}

/**
 * Enigma2 EPGImport requires programmes grouped by channel id (not by date).
 * Category is mapped to sub-title because EPGImport reads title/sub-title/desc only.
 */
export function prepareRytecDocument(doc: XmltvDocument): XmltvDocument {
  const channels = [...doc.channels].sort((a, b) => a.id.localeCompare(b.id));
  const programmes = [...doc.programmes].sort((a, b) => {
    const byChannel = a.channel.localeCompare(b.channel);
    if (byChannel !== 0) return byChannel;
    return a.start.localeCompare(b.start);
  });

  return { channels, programmes };
}

export function buildRytecXmltv(doc: XmltvDocument): string {
  const prepared = prepareRytecDocument(doc);

  const tv = {
    tv: {
      "@_generator-info-name": "FreeEPG Rytec",
      "@_generator-info-url": "https://free-epg.de",
      channel: prepared.channels.map((ch) => ({
        "@_id": ch.id,
        "display-name": ch.displayName,
        ...(ch.icon ? { icon: { "@_src": ch.icon } } : {}),
      })),
      programme: prepared.programmes.map((p) => buildRytecProgrammeNode(p)),
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(tv)}`;
}

function buildRytecProgrammeNode(p: XmltvProgramme): Record<string, unknown> {
  return {
    "@_start": p.start,
    "@_stop": p.stop,
    "@_channel": p.channel,
    title: { "@_lang": "de", "#text": p.title },
    ...(p.category
      ? { "sub-title": { "@_lang": "de", "#text": p.category } }
      : {}),
    ...(p.desc ? { desc: { "@_lang": "de", "#text": p.desc } } : {}),
  };
}

export interface RytecSourceEntry {
  country: string;
  description: string;
  epgUrl: string;
  channelsUrl: string;
}

export function buildRytecChannelsXml(
  channels: Array<{ id: string; name: string }>
): string {
  const sorted = [...channels].sort((a, b) => a.id.localeCompare(b.id));
  const lines = sorted.map(
    (ch) =>
      `  <channel id="${escapeXmlAttr(ch.id)}">SERVICE_REF</channel><!-- ${escapeComment(ch.name)} -->`
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<!--",
    "  FreeEPG Rytec channel map — replace SERVICE_REF with your Enigma2 service",
    "  reference from /etc/enigma2/lamedb, then save as custom.channels.xml",
    "-->",
    "<channels>",
    ...lines,
    "</channels>",
    "",
  ].join("\n");
}

export function buildRytecSourcesXml(
  entries: RytecSourceEntry[],
  sourcecatName = "FreeEPG Rytec XMLTV"
): string {
  const sources = entries.map((entry) => ({
    "@_type": "gen_xmltv",
    "@_channels": entry.channelsUrl,
    description: entry.description,
    url: entry.epgUrl,
  }));

  const doc = {
    sources: {
      sourcecat: {
        "@_sourcecatname": sourcecatName,
        source: sources,
      },
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(doc)}`;
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeComment(value: string): string {
  return value.replace(/--/g, "—");
}
