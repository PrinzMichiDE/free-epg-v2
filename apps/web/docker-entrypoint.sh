#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  if [ ! -f "./packages/db/dist/docker-init.js" ]; then
    echo "ERROR: packages/db/dist/docker-init.js not found — cannot migrate database"
    exit 1
  fi
  echo "Running database init..."
  node ./packages/db/dist/docker-init.js
fi

exec "$@"
