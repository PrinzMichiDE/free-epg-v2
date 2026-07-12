#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ -f "./packages/db/dist/docker-init.js" ]; then
  echo "Running database init..."
  node ./packages/db/dist/docker-init.js
fi

exec "$@"
