#!/bin/sh
set -e

# Docker sets HOSTNAME to the container id; Next.js standalone binds to HOSTNAME.
export HOSTNAME=0.0.0.0

if [ -n "$DATABASE_URL" ] && [ -f "./packages/db/dist/docker-migrate.js" ]; then
  echo "Running database migrations..."
  node ./packages/db/dist/docker-migrate.js
fi

exec "$@"
