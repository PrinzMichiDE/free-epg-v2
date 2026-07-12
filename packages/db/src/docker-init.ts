import { sql } from "drizzle-orm";
import { getDb, channels, closeDb } from "./index.js";
import { runMigrations } from "./docker-migrate.js";
import { runSeed } from "./seed.js";

export async function runDockerInit() {
  await runMigrations();

  const seedOnStart = process.env.SEED_ON_START !== "false";
  const dbConn = getDb();
  const [{ count }] = await dbConn
    .select({ count: sql<number>`count(*)::int` })
    .from(channels);

  if (seedOnStart && count === 0) {
    console.log("[db-init] Empty database — seeding iptv-org metadata...");
    await runSeed();
    await closeDb();
    console.log("[db-init] Seed complete");
    return;
  }

  console.log(`[db-init] Seed skipped (${count} channels in database)`);
  await closeDb();
}

if (process.argv[1]?.includes("docker-init")) {
  runDockerInit().catch((err) => {
    console.error("[db-init] Failed:", err);
    process.exit(1);
  });
}
