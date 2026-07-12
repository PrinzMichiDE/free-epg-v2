import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDb, channels, closeDb } from "./index.js";
import { runSeed } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../drizzle");

async function waitForPostgres(url: string, attempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const client = postgres(url, { max: 1, connect_timeout: 5 });
      await client`select 1`;
      await client.end();
      console.log("[db-init] Database connection ready");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[db-init] Waiting for database (${attempt}/${attempts}): ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Database not ready after retries");
}

async function assertSchemaReady(): Promise<void> {
  const db = getDb();
  await db.execute(sql`select 1 from "epg_jobs" limit 1`);
  await db.execute(sql`select 1 from "channels" limit 1`);
  await closeDb();
  console.log("[db-init] Schema verified");
}

export async function runDockerInit() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  await waitForPostgres(url);

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  console.log(`[db-init] Running migrations from ${migrationsFolder}...`);
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log("[db-init] Migrations complete");

  await assertSchemaReady();

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

const isMain =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  runDockerInit().catch((err) => {
    console.error("[db-init] Failed:", err);
    process.exit(1);
  });
}
