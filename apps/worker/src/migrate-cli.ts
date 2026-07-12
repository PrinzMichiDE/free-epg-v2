import { runMigrations } from "@freeepg/db/migrate";

runMigrations().catch((err) => {
  console.error("[db-migrate] Failed:", err);
  process.exit(1);
});
