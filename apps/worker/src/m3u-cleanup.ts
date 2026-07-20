import { rm } from "node:fs/promises";
import path from "node:path";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { getDb, m3uPlaylists, epgJobs } from "@freeepg/db";

export const M3U_ID_PATTERN = /^[a-zA-Z0-9_-]{4,64}$/;

export function m3uArtifactPaths(epgDataDir: string, id: string): string[] {
  if (!M3U_ID_PATTERN.test(id)) {
    return [];
  }
  const xmlPath = path.join(epgDataDir, "m3u", `${id}.xml`);
  return [xmlPath, `${xmlPath}.gz`];
}

export async function deleteM3uArtifacts(
  epgDataDir: string,
  id: string
): Promise<string[]> {
  const deleted: string[] = [];
  for (const filePath of m3uArtifactPaths(epgDataDir, id)) {
    try {
      await rm(filePath, { force: true });
      deleted.push(filePath);
    } catch {
      // Best-effort filesystem cleanup; DB row removal remains authoritative.
    }
  }
  return deleted;
}

export async function cleanupExpiredM3uPlaylists(epgDataDir: string, now = new Date()) {
  const db = getDb();
  const [job] = await db
    .insert(epgJobs)
    .values({
      jobType: "m3u_cleanup",
      status: "running",
      startedAt: now,
    })
    .returning();

  try {
    const expired = await db
      .select({
        id: m3uPlaylists.id,
        epgXmlPath: m3uPlaylists.epgXmlPath,
      })
      .from(m3uPlaylists)
      .where(and(isNotNull(m3uPlaylists.expiresAt), lt(m3uPlaylists.expiresAt, now)));

    let removedFiles = 0;
    for (const playlist of expired) {
      const deleted = await deleteM3uArtifacts(epgDataDir, playlist.id);
      removedFiles += deleted.length;
      if (playlist.epgXmlPath && !deleted.includes(playlist.epgXmlPath)) {
        try {
          await rm(playlist.epgXmlPath, { force: true });
          await rm(`${playlist.epgXmlPath}.gz`, { force: true });
          removedFiles += 1;
        } catch {
          // ignore missing files
        }
      }
    }

    if (expired.length > 0) {
      await db
        .delete(m3uPlaylists)
        .where(and(isNotNull(m3uPlaylists.expiresAt), lt(m3uPlaylists.expiresAt, now)));
    }

    const result = {
      expiredPlaylists: expired.length,
      removedFiles,
    };

    await db
      .update(epgJobs)
      .set({
        status: "completed",
        finishedAt: new Date(),
        metadata: result,
      })
      .where(eq(epgJobs.id, job.id));

    console.log(
      `[m3u-cleanup] removed ${result.expiredPlaylists} playlists, ${result.removedFiles} files`
    );
    return result;
  } catch (err) {
    await db
      .update(epgJobs)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      })
      .where(eq(epgJobs.id, job.id));
    throw err;
  }
}
