import { createHash } from "node:crypto";
import type { Session } from "next-auth";
import { desc } from "drizzle-orm";
import { adminAuditLogs } from "@freeepg/db";
import { getDatabase } from "@/lib/db";

function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function logAdminAction(
  session: Session,
  action: string,
  options?: {
    target?: string;
    metadata?: Record<string, unknown>;
    ip?: string | null;
  }
): Promise<void> {
  const db = getDatabase();
  await db.insert(adminAuditLogs).values({
    actorEmail: session.user?.email ?? "unknown",
    action,
    target: options?.target,
    metadata: options?.metadata,
    ipHash: hashIp(options?.ip ?? null),
  });
}

export async function listRecentAdminAuditLogs(limit = 50) {
  const db = getDatabase();
  return db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}
