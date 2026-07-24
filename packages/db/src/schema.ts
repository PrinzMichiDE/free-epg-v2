import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const channels = pgTable(
  "channels",
  {
    id: serial("id").primaryKey(),
    xmltvId: text("xmltv_id").notNull().unique(),
    name: text("name").notNull(),
    altNames: jsonb("alt_names").$type<string[]>().default([]),
    country: text("country").notNull(),
    lang: text("lang"),
    logoUrl: text("logo_url"),
    categories: jsonb("categories").$type<string[]>().default([]),
    website: text("website"),
    source: text("source"),
    hasEpg: boolean("has_epg").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_channels_country").on(t.country),
    index("idx_channels_name").on(t.name),
  ]
);

export const programmes = pgTable(
  "programmes",
  {
    id: serial("id").primaryKey(),
    channelId: integer("channel_id")
      .references(() => channels.id)
      .notNull(),
    start: timestamp("start").notNull(),
    stop: timestamp("stop").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    source: text("source"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_programmes_channel_start").on(t.channelId, t.start),
  ]
);

export const epgSources = pgTable("epg_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(),
  url: text("url"),
  priority: integer("priority").default(0).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  lastFetch: timestamp("last_fetch"),
  status: text("status").default("idle"),
  channelCount: integer("channel_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const epgJobs = pgTable("epg_jobs", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => epgSources.id),
  country: text("country"),
  jobType: text("job_type").notNull(),
  status: text("status").default("pending").notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customLists = pgTable("custom_lists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  channelIds: jsonb("channel_ids").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedFiles = pgTable("generated_files", {
  id: serial("id").primaryKey(),
  country: text("country"),
  listId: text("list_id"),
  m3uId: text("m3u_id"),
  path: text("path").notNull(),
  gzipPath: text("gzip_path"),
  size: integer("size").default(0),
  checksum: text("checksum"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const m3uPlaylists = pgTable("m3u_playlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  sourceUrl: text("source_url"),
  entryCount: integer("entry_count").default(0),
  matchedCount: integer("matched_count").default(0),
  epgXmlPath: text("epg_xml_path"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const m3uEntries = pgTable(
  "m3u_entries",
  {
    id: serial("id").primaryKey(),
    playlistId: text("playlist_id")
      .references(() => m3uPlaylists.id, { onDelete: "cascade" })
      .notNull(),
    lineNumber: integer("line_number").notNull(),
    tvgName: text("tvg_name"),
    tvgIdOriginal: text("tvg_id_original"),
    tvgIdMatched: text("tvg_id_matched"),
    tvgLogo: text("tvg_logo"),
    groupTitle: text("group_title"),
    streamUrl: text("stream_url"),
    matchConfidence: real("match_confidence").default(0),
    matchMethod: text("match_method").default("unmatched"),
    channelId: integer("channel_id").references(() => channels.id),
  },
  (t) => [index("idx_m3u_entries_playlist").on(t.playlistId)]
);

export const m3uMatchOverrides = pgTable(
  "m3u_match_overrides",
  {
    id: serial("id").primaryKey(),
    tvgNameNormalized: text("tvg_name_normalized").notNull(),
    tvgIdMatched: text("tvg_id_matched").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_m3u_overrides_name").on(t.tvgNameNormalized),
  ]
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    path: text("path"),
    method: text("method"),
    country: text("country"),
    statusCode: integer("status_code"),
    responseTimeMs: integer("response_time_ms"),
    bytesSent: integer("bytes_sent"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_analytics_events_created").on(t.createdAt)]
);

export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    id: serial("id").primaryKey(),
    date: text("date").notNull(),
    metric: text("metric").notNull(),
    dimension: text("dimension").default(""),
    value: real("value").notNull(),
  },
  (t) => [
    uniqueIndex("idx_analytics_daily_unique").on(t.date, t.metric, t.dimension),
  ]
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: serial("id").primaryKey(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    target: text("target"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("idx_admin_audit_logs_created").on(t.createdAt)]
);

export type Channel = typeof channels.$inferSelect;
export type Programme = typeof programmes.$inferSelect;
export type EpgSource = typeof epgSources.$inferSelect;
export type EpgJob = typeof epgJobs.$inferSelect;
export type M3uPlaylist = typeof m3uPlaylists.$inferSelect;
export type M3uEntry = typeof m3uEntries.$inferSelect;
export type GeneratedFile = typeof generatedFiles.$inferSelect;
