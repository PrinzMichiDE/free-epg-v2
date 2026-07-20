export const M3U_ID_PATTERN = /^[a-zA-Z0-9_-]{4,64}$/;
export const MAX_M3U_BYTES = 5 * 1024 * 1024;
export const MAX_M3U_ENTRIES = 5000;

export function isValidM3uId(id: string): boolean {
  return M3U_ID_PATTERN.test(id);
}

export function isPlaylistExpired(
  expiresAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!expiresAt) return false;
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() <= now.getTime();
}

export function expiredPlaylistResponse(): Response {
  return Response.json(
    { error: "Playlist expired" },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}
