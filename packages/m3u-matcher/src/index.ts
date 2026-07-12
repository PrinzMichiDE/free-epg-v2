import {
  matchChannel,
  normalizeChannelName,
  type ChannelRecord,
} from "@freeepg/epg-core";

export interface M3uEntry {
  lineNumber: number;
  tvgName?: string;
  tvgId?: string;
  tvgLogo?: string;
  groupTitle?: string;
  displayName?: string;
  streamUrl: string;
  rawExtinf: string;
}

const EXTINF_RE =
  /#EXTINF:.*?tvg-id="([^"]*)".*?tvg-name="([^"]*)".*?(?:tvg-logo="([^"]*)")?.*?(?:group-title="([^"]*)")?.*,(.+)$/i;

const EXTINF_SIMPLE = /#EXTINF:[^,]*,(.+)$/i;

function parseExtinf(line: string): Partial<M3uEntry> {
  const match = line.match(EXTINF_RE);
  if (match) {
    return {
      tvgId: match[1] || undefined,
      tvgName: match[2] || undefined,
      tvgLogo: match[3] || undefined,
      groupTitle: match[4] || undefined,
      displayName: match[5]?.trim(),
      rawExtinf: line,
    };
  }
  const simple = line.match(EXTINF_SIMPLE);
  return {
    displayName: simple?.[1]?.trim(),
    rawExtinf: line,
  };
}

export function parseM3u(content: string): M3uEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: M3uEntry[] = [];
  let lineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF:")) continue;
    lineNumber++;

    const parsed = parseExtinf(line);
    let streamUrl = "";
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim();
      if (next && !next.startsWith("#")) {
        streamUrl = next;
        break;
      }
    }

    entries.push({
      lineNumber,
      tvgName: parsed.tvgName ?? parsed.displayName,
      tvgId: parsed.tvgId,
      tvgLogo: parsed.tvgLogo,
      groupTitle: parsed.groupTitle,
      displayName: parsed.displayName,
      streamUrl,
      rawExtinf: line,
    });

    if (entries.length >= 5000) break;
  }

  return entries;
}

export interface MatchedEntry extends M3uEntry {
  tvgIdMatched?: string;
  matchConfidence: number;
  matchMethod: string;
}

export function matchM3uEntries(
  entries: M3uEntry[],
  catalog: ChannelRecord[],
  overrides?: Map<string, string>
): MatchedEntry[] {
  return entries.map((entry) => {
    const result = matchChannel(
      entry.tvgId,
      entry.tvgName ?? entry.displayName,
      entry.groupTitle,
      catalog,
      overrides
    );
    return {
      ...entry,
      tvgIdMatched: result?.xmltvId,
      matchConfidence: result?.confidence ?? 0,
      matchMethod: result?.method ?? "unmatched",
    };
  });
}

export function enrichM3u(
  content: string,
  matched: MatchedEntry[],
  epgUrl: string
): string {
  const matchByLine = new Map(matched.map((m) => [m.rawExtinf, m]));
  const lines = content.split(/\r?\n/);
  const out: string[] = [];

  if (!lines[0]?.includes("#EXTM3U")) {
    out.push(`#EXTM3U x-tvg-url="${epgUrl}"`);
  }

  for (const line of lines) {
    if (line.startsWith("#EXTM3U")) {
      if (line.includes("x-tvg-url")) {
        out.push(line);
      } else {
        out.push(`${line} x-tvg-url="${epgUrl}"`);
      }
      continue;
    }

    if (line.startsWith("#EXTINF:")) {
      const m = matchByLine.get(line.trim());
      if (m?.tvgIdMatched) {
        let enriched = line;
        if (/tvg-id="[^"]*"/.test(enriched)) {
          enriched = enriched.replace(/tvg-id="[^"]*"/, `tvg-id="${m.tvgIdMatched}"`);
        } else {
          enriched = enriched.replace("#EXTINF:", `#EXTINF: tvg-id="${m.tvgIdMatched}"`);
        }
        out.push(enriched);
        continue;
      }
    }
    out.push(line);
  }

  return out.join("\n");
}

export { normalizeChannelName };
