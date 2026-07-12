#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ -f "./packages/db/dist/docker-migrate.js" ]; then
  echo "Running database migrations..."
  node ./packages/db/dist/docker-migrate.js
fi

exec "$@"
