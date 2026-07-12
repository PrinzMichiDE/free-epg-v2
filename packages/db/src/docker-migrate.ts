import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../drizzle");

async function waitForPostgres(url: string, attempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const client = postgres(url, { max: 1, connect_timeout: 5 });
      await client`select 1`;
      await client.end();
      console.log("[db-migrate] Database connection ready");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[db-migrate] Waiting for database (${attempt}/${attempts}): ${message}`);
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
  console.log("[db-migrate] Schema verified");
}

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  await waitForPostgres(url);

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  console.log(`[db-migrate] Running migrations from ${migrationsFolder}...`);
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log("[db-migrate] Migrations complete");

  await assertSchemaReady();
}

if (process.argv[1]?.includes("docker-migrate")) {
  runMigrations().catch((err) => {
    console.error("[db-migrate] Failed:", err);
    process.exit(1);
  });
}
