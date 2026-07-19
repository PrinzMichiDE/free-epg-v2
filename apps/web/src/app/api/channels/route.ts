import { NextRequest } from "next/server";
import { sql, eq, ilike, or, and } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels } from "@freeepg/db";

export async function GET(request: NextRequest) {
  const db = getDatabase();
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 50;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (country) conditions.push(eq(channels.country, country.toUpperCase()));
  if (q) {
    conditions.push(
      or(
        ilike(channels.name, `%${q}%`),
        ilike(channels.xmltvId, `%${q}%`),
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${channels.altNames}) AS alt
          WHERE alt ILIKE ${`%${q}%`}
        )`
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select({
      id: channels.id,
      xmltvId: channels.xmltvId,
      name: channels.name,
      country: channels.country,
      categories: channels.categories,
      logoUrl: channels.logoUrl,
      hasEpg: channels.hasEpg,
    })
    .from(channels)
    .where(where)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(channels)
    .where(where);

  return Response.json({
    channels: results,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
}
