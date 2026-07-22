CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "actor_email" text NOT NULL,
  "action" text NOT NULL,
  "target" text,
  "metadata" jsonb,
  "ip_hash" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_admin_audit_logs_created" ON "admin_audit_logs" ("created_at");
