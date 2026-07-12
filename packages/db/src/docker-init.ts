import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDb, channels, closeDb } from "./index.js";
import { runSeed } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runDockerInit() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  console.log("[db-init] Running migrations...");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  await client.end();
  console.log("[db-init] Migrations complete");

  const seedOnStart = process.env.SEED_ON_START !== "false";
  const dbConn = getDb();
  const [{ count }] = await dbConn
    .select({ count: sql<number>`count(*)::int` })
    .from(channels);

  if (seedOnStart && count === 0) {
    console.log("[db-init] Empty database — seeding iptv-org metadata...");
    await runSeed();
    return;
  }

  console.log(`[db-init] Seed skipped (${count} channels in database)`);
  await closeDb();
}

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  runDockerInit().catch((err) => {
    console.error("[db-init] Failed:", err);
    process.exit(1);
  });
}
