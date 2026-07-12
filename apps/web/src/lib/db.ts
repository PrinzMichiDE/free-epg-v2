import { getDb } from "@freeepg/db";

export function getDatabase() {
  return getDb(process.env.DATABASE_URL);
}
