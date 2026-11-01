const STORAGE_KEY = "freeepg:recent-channels";

export interface RecentChannel {
  playlistCode: string;
  channelId: string;
  title: string;
  logoUrl: string | null;
  timestamp: number;
}

export function readRecentChannels(limit = 10): RecentChannel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentChannel[];
    return parsed
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function writeRecentChannel(channel: Omit<RecentChannel, "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const normalized = {
      ...channel,
      logoUrl: channel.logoUrl ?? null,
    };
    const existing = readRecentChannels(50);
    const filtered = existing.filter(
      (item) => !(item.playlistCode === normalized.playlistCode && item.channelId === normalized.channelId)
    );
    const updated = [
      { ...normalized, timestamp: Date.now() },
      ...filtered,
    ].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
