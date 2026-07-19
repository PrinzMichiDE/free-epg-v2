import {
  and,
  asc,
  count,
  eq,
  gt,
  ilike,
  lt,
  lte,
  or,
} from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { channels, programmes } from "@freeepg/db";

export interface ProgrammeSearchResult {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  start: string;
  stop: string;
  channel: {
    xmltvId: string;
    name: string;
    country: string;
    logoUrl: string | null;
  };
}

function mapRow(row: {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  start: Date;
  stop: Date;
  xmltvId: string;
  channelName: string;
  country: string;
  logoUrl: string | null;
}): ProgrammeSearchResult {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    start: row.start.toISOString(),
    stop: row.stop.toISOString(),
    channel: {
      xmltvId: row.xmltvId,
      name: row.channelName,
      country: row.country,
      logoUrl: row.logoUrl,
    },
  };
}

function buildWhenConditions(when: "now" | "upcoming" | "all", now: Date) {
  switch (when) {
    case "now":
      return and(lte(programmes.start, now), gt(programmes.stop, now));
    case "upcoming":
      return gt(programmes.start, now);
    case "all":
      return undefined;
    default: {
      const _exhaustive: never = when;
      return _exhaustive;
    }
  }
}

export async function searchProgrammes(options: {
  q?: string;
  country?: string;
  page?: number;
  limit?: number;
  when?: "now" | "upcoming" | "all";
}): Promise<{
  programmes: ProgrammeSearchResult[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const db = getDatabase();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 30));
  const offset = (page - 1) * limit;
  const when = options.when ?? "all";
  const now = new Date();
  const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const conditions = [gt(programmes.stop, now), lt(programmes.start, horizon)];

  const whenCondition = buildWhenConditions(when, now);
  if (whenCondition) conditions.push(whenCondition);

  if (options.country) {
    conditions.push(eq(channels.country, options.country.toUpperCase()));
  }

  const q = options.q?.trim();
  if (q) {
    conditions.push(
      or(
        ilike(programmes.title, `%${q}%`),
        ilike(programmes.description, `%${q}%`),
        ilike(channels.name, `%${q}%`)
      )!
    );
  }

  const where = and(...conditions);

  const rows = await db
    .select({
      id: programmes.id,
      title: programmes.title,
      description: programmes.description,
      category: programmes.category,
      start: programmes.start,
      stop: programmes.stop,
      xmltvId: channels.xmltvId,
      channelName: channels.name,
      country: channels.country,
      logoUrl: channels.logoUrl,
    })
    .from(programmes)
    .innerJoin(channels, eq(programmes.channelId, channels.id))
    .where(where)
    .orderBy(asc(programmes.start))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(programmes)
    .innerJoin(channels, eq(programmes.channelId, channels.id))
    .where(where);

  return {
    programmes: rows.map(mapRow),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getNowPlayingByCountry(
  countryCode: string,
  limit = 12
): Promise<ProgrammeSearchResult[]> {
  const db = getDatabase();
  const now = new Date();
  const cc = countryCode.toUpperCase();

  const rows = await db
    .select({
      id: programmes.id,
      title: programmes.title,
      description: programmes.description,
      category: programmes.category,
      start: programmes.start,
      stop: programmes.stop,
      xmltvId: channels.xmltvId,
      channelName: channels.name,
      country: channels.country,
      logoUrl: channels.logoUrl,
    })
    .from(programmes)
    .innerJoin(channels, eq(programmes.channelId, channels.id))
    .where(
      and(
        eq(channels.country, cc),
        lte(programmes.start, now),
        gt(programmes.stop, now)
      )
    )
    .orderBy(asc(channels.name))
    .limit(limit);

  return rows.map(mapRow);
}
