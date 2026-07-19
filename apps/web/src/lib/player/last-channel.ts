const STORAGE_PREFIX = "freeepg:last-channel:";

export function readLastChannelId(playlistCode: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${playlistCode}`);
  } catch {
    return null;
  }
}

export function writeLastChannelId(playlistCode: string, entryId: string) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${playlistCode}`, entryId);
  } catch {
    // ignore quota / private mode
  }
}
