#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[db-seed] DATABASE_URL is not set"
  exit 1
fi

cd /app

if command -v psql >/dev/null 2>&1; then
  COUNT=$(psql -h postgres -U freeepg -d freeepg -tAc "select count(*) from channels" 2>/dev/null | tr -d '[:space:]' || echo "0")
  if [ "$COUNT" != "0" ] && [ -n "$COUNT" ]; then
    echo "[db-seed] skipped ($COUNT channels already present)"
    exit 0
  fi
fi

if [ ! -f packages/db/dist/seed.js ]; then
  echo "[db-seed] building @freeepg/db from source..."
  NPM_CONFIG_PRODUCTION=false npm ci --ignore-scripts
  npm run build -w @freeepg/db
fi

echo "[db-seed] importing iptv-org channel metadata..."
node packages/db/dist/seed.js
echo "[db-seed] complete"
