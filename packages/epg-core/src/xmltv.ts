import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { XmltvChannel, XmltvDocument, XmltvProgramme } from "./matcher.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["channel", "programme", "display-name", "icon", "category"].includes(name),
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  suppressEmptyNode: true,
});

function textValue(node: unknown): string {
  if (typeof node === "string") return node;
  if (node && typeof node === "object" && "#text" in node) {
    return String((node as { "#text": string })["#text"]);
  }
  return String(node ?? "");
}

export function parseXmltv(xml: string): XmltvDocument {
  const doc = parser.parse(xml) as {
    tv?: {
      channel?: Array<Record<string, unknown>>;
      programme?: Array<Record<string, unknown>>;
    };
  };

  const channels: XmltvChannel[] = (doc.tv?.channel ?? []).map((ch) => {
    const id = String(ch["@_id"] ?? "");
    const displayNames = ch["display-name"];
    const firstName = Array.isArray(displayNames)
      ? textValue(displayNames[0])
      : textValue(displayNames);
    const icons = ch.icon;
    const icon = Array.isArray(icons)
      ? String((icons[0] as Record<string, string>)["@_src"] ?? "")
      : icons
        ? String((icons as Record<string, string>)["@_src"] ?? "")
        : undefined;
    return { id, displayName: firstName || id, icon: icon || undefined };
  });

  const programmes: XmltvProgramme[] = (doc.tv?.programme ?? []).map((p) => ({
    channel: String(p["@_channel"] ?? ""),
    start: String(p["@_start"] ?? ""),
    stop: String(p["@_stop"] ?? ""),
    title: textValue(p.title),
    desc: p.desc ? textValue(p.desc) : undefined,
    category: p.category ? textValue(p.category) : undefined,
  }));

  return { channels, programmes };
}

export function buildXmltv(doc: XmltvDocument): string {
  const tv = {
    tv: {
      "@_generator-info-name": "FreeEPG",
      "@_generator-info-url": "https://free-epg.de",
      channel: doc.channels.map((ch) => ({
        "@_id": ch.id,
        "display-name": ch.displayName,
        ...(ch.icon ? { icon: { "@_src": ch.icon } } : {}),
      })),
      programme: doc.programmes.map((p) => ({
        "@_start": p.start,
        "@_stop": p.stop,
        "@_channel": p.channel,
        title: p.title,
        ...(p.desc ? { desc: p.desc } : {}),
        ...(p.category ? { category: p.category } : {}),
      })),
    },
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(tv)}`;
}

export function mergeXmltvDocs(
  primary: XmltvDocument,
  fallback: XmltvDocument,
  priority: "primary" | "fallback" = "primary"
): XmltvDocument {
  const channelMap = new Map<string, XmltvChannel>();
  for (const ch of fallback.channels) channelMap.set(ch.id, ch);
  for (const ch of primary.channels) channelMap.set(ch.id, ch);

  const programmeMap = new Map<string, XmltvProgramme>();
  const key = (p: XmltvProgramme) => `${p.channel}|${p.start}`;

  for (const p of fallback.programmes) programmeMap.set(key(p), p);
  for (const p of primary.programmes) {
    if (priority === "primary" || !programmeMap.has(key(p))) {
      programmeMap.set(key(p), p);
    }
  }

  return {
    channels: [...channelMap.values()],
    programmes: [...programmeMap.values()],
  };
}

export function filterXmltvByChannelIds(
  doc: XmltvDocument,
  channelIds: string[]
): XmltvDocument {
  const idSet = new Set(channelIds);
  return {
    channels: doc.channels.filter((c) => idSet.has(c.id)),
    programmes: doc.programmes.filter((p) => idSet.has(p.channel)),
  };
}

export * from "./matcher.js";
