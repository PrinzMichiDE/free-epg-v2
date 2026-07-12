CREATE TABLE IF NOT EXISTS "channels" (
  "id" serial PRIMARY KEY NOT NULL,
  "xmltv_id" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "alt_names" jsonb DEFAULT '[]'::jsonb,
  "country" text NOT NULL,
  "lang" text,
  "logo_url" text,
  "categories" jsonb DEFAULT '[]'::jsonb,
  "website" text,
  "source" text,
  "has_epg" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_channels_country" ON "channels" ("country");
CREATE INDEX IF NOT EXISTS "idx_channels_name" ON "channels" ("name");

CREATE TABLE IF NOT EXISTS "programmes" (
  "id" serial PRIMARY KEY NOT NULL,
  "channel_id" integer NOT NULL REFERENCES "channels"("id"),
  "start" timestamp NOT NULL,
  "stop" timestamp NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "category" text,
  "source" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_programmes_channel_start" ON "programmes" ("channel_id", "start");

CREATE TABLE IF NOT EXISTS "epg_sources" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL UNIQUE,
  "type" text NOT NULL,
  "url" text,
  "priority" integer DEFAULT 0 NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "last_fetch" timestamp,
  "status" text DEFAULT 'idle',
  "channel_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "epg_jobs" (
  "id" serial PRIMARY KEY NOT NULL,
  "source_id" integer REFERENCES "epg_sources"("id"),
  "country" text,
  "job_type" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "started_at" timestamp,
  "finished_at" timestamp,
  "error" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "custom_lists" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "channel_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "generated_files" (
  "id" serial PRIMARY KEY NOT NULL,
  "country" text,
  "list_id" text,
  "m3u_id" text,
  "path" text NOT NULL,
  "gzip_path" text,
  "size" integer DEFAULT 0,
  "checksum" text,
  "generated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "m3u_playlists" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "source_type" text NOT NULL,
  "source_url" text,
  "entry_count" integer DEFAULT 0,
  "matched_count" integer DEFAULT 0,
  "epg_xml_path" text,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "m3u_entries" (
  "id" serial PRIMARY KEY NOT NULL,
  "playlist_id" text NOT NULL REFERENCES "m3u_playlists"("id") ON DELETE CASCADE,
  "line_number" integer NOT NULL,
  "tvg_name" text,
  "tvg_id_original" text,
  "tvg_id_matched" text,
  "tvg_logo" text,
  "group_title" text,
  "stream_url" text,
  "match_confidence" real DEFAULT 0,
  "match_method" text DEFAULT 'unmatched',
  "channel_id" integer REFERENCES "channels"("id")
);
CREATE INDEX IF NOT EXISTS "idx_m3u_entries_playlist" ON "m3u_entries" ("playlist_id");

CREATE TABLE IF NOT EXISTS "m3u_match_overrides" (
  "id" serial PRIMARY KEY NOT NULL,
  "tvg_name_normalized" text NOT NULL,
  "tvg_id_matched" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_m3u_overrides_name" ON "m3u_match_overrides" ("tvg_name_normalized");

CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "path" text,
  "method" text,
  "country" text,
  "status_code" integer,
  "response_time_ms" integer,
  "bytes_sent" integer,
  "referrer" text,
  "user_agent" text,
  "ip_hash" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_analytics_events_created" ON "analytics_events" ("created_at");

CREATE TABLE IF NOT EXISTS "analytics_daily" (
  "id" serial PRIMARY KEY NOT NULL,
  "date" text NOT NULL,
  "metric" text NOT NULL,
  "dimension" text DEFAULT '',
  "value" real NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_analytics_daily_unique" ON "analytics_daily" ("date", "metric", "dimension");

CREATE EXTENSION IF NOT EXISTS pg_trgm;
