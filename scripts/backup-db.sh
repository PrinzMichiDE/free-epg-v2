#!/bin/bash
# Backup script for FreeEPG PostgreSQL database
# Usage: ./scripts/backup-db.sh [backup_dir]

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/freeepg_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting backup at $(date)"

if [ -n "$DATABASE_URL" ]; then
  # Use DATABASE_URL if provided
  pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
else
  # Use docker compose if running in container environment
  docker compose exec -T postgres pg_dump -U freeepg freeepg | gzip > "$BACKUP_FILE"
fi

echo "[backup] Backup completed: $BACKUP_FILE"
echo "[backup] Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "freeepg_*.sql.gz" -mtime +7 -delete
echo "[backup] Old backups cleaned up"
