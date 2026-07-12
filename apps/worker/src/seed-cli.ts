import { sql } from "drizzle-orm";
import { getDb, channels, closeDb } from "@freeepg/db";
import { runSeed } from "@freeepg/db/seed";

async function main() {
  const db = getDb();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(channels);

  if (count > 0) {
    console.log(`[db-seed] skipped (${count} channels already present)`);
    await closeDb();
    return;
  }

  console.log("[db-seed] importing iptv-org channel metadata...");
  await runSeed();
  console.log("[db-seed] complete");
}

main().catch((err) => {
  console.error("[db-seed] failed:", err);
  process.exit(1);
});
