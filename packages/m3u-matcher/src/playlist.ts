export interface PlaylistStreamEntry {
  tvgId: string;
  title: string;
  url: string;
  groupTitle?: string;
  tvgLogo?: string;
}

function escapeM3uAttr(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildM3uPlaylist(
  entries: PlaylistStreamEntry[],
  epgUrl: string
): string {
  const lines = [`#EXTM3U x-tvg-url="${escapeM3uAttr(epgUrl)}"`];

  for (const entry of entries) {
    const attrs = [
      `tvg-id="${escapeM3uAttr(entry.tvgId)}"`,
      `tvg-name="${escapeM3uAttr(entry.title)}"`,
    ];
    if (entry.tvgLogo) {
      attrs.push(`tvg-logo="${escapeM3uAttr(entry.tvgLogo)}"`);
    }
    if (entry.groupTitle) {
      attrs.push(`group-title="${escapeM3uAttr(entry.groupTitle)}"`);
    }
    lines.push(`#EXTINF:-1 ${attrs.join(" ")},${entry.title}`);
    lines.push(entry.url);
  }

  return `${lines.join("\n")}\n`;
}

const QUALITY_ORDER: Record<string, number> = {
  "4k": 5,
  "2160p": 5,
  "1080p": 4,
  "720p": 3,
  "540p": 2,
  "480p": 2,
  "360p": 1,
  "240p": 0,
};

export function qualityScore(quality?: string | null): number {
  if (!quality) return 0;
  return QUALITY_ORDER[quality.toLowerCase()] ?? 0;
}

export interface StreamCandidate {
  channelId: string;
  title: string;
  url: string;
  quality?: string | null;
}

export function pickBestStreamsPerChannel(
  streams: StreamCandidate[],
  maxEntries = 3000
): StreamCandidate[] {
  const best = new Map<string, StreamCandidate>();

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
