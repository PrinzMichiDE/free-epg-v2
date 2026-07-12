import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url =
    process.env.DATABASE_URL ??
    "postgresql://freeepg:freeepg@localhost:5432/freeepg";
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
