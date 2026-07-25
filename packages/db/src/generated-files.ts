import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { getDb } from "./index.js";
import { generatedFiles, type GeneratedFile } from "./schema.js";

type Db = ReturnType<typeof getDb>;

export interface CountryGeneratedFileInput {
  country: string;
  path: string;
  gzipPath: string;
  size: number;
  checksum: string;
}

/** Replace prior country-level EPG file metadata (avoids unbounded row growth). */
export async function replaceCountryGeneratedFile(
  db: Db,
  data: CountryGeneratedFileInput
): Promise<void> {
  const country = data.country.toUpperCase();
  await db
    .delete(generatedFiles)
    .where(
      and(
        eq(generatedFiles.country, country),
        isNull(generatedFiles.listId),
        isNull(generatedFiles.m3uId)
      )
    );
  await db.insert(generatedFiles).values({
    country,
    path: data.path,
    gzipPath: data.gzipPath,
    size: data.size,
    checksum: data.checksum,
  });
}

/** Latest generated file row per country (country-level feeds only). */
export async function getLatestCountryFileMap(
  db: Db
): Promise<Map<string, GeneratedFile>> {
  const rows = await db
    .select()
    .from(generatedFiles)
    .where(
      and(isNotNull(generatedFiles.country), isNull(generatedFiles.listId))
    )
    .orderBy(generatedFiles.country, desc(generatedFiles.generatedAt));

  const map = new Map<string, GeneratedFile>();
  for (const row of rows) {
    if (row.country && !map.has(row.country)) {
      map.set(row.country, row);
    }
  }
  return map;
}
