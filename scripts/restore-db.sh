#!/bin/bash
# Restore script for FreeEPG PostgreSQL database
# Usage: ./scripts/restore-db.sh <backup_file.sql.gz>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE not found"
  exit 1
fi

echo "[restore] WARNING: This will overwrite the current database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "[restore] Restore cancelled"
  exit 0
fi

echo "[restore] Starting restore from $BACKUP_FILE at $(date)"

if [ -n "$DATABASE_URL" ]; then
  gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
else
  docker compose exec -T postgres psql -U freeepg -d freeepg -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U freeepg -d freeepg
fi

echo "[restore] Restore completed at $(date)"
