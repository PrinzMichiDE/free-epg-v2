#!/usr/bin/env bash
# FreeEPG backup helper — PostgreSQL dump + EPG volume archive.
# Run on the host with Docker Compose access (prod: use stack.env).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${ROOT_DIR}/backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-stack.env}"

mkdir -p "${BACKUP_DIR}"

echo "[backup] PostgreSQL dump → ${BACKUP_DIR}/freeepg-pg-${TIMESTAMP}.sql.gz"
docker compose --env-file "${ENV_FILE}" -f "${ROOT_DIR}/${COMPOSE_FILE}" exec -T postgres \
  pg_dump -U freeepg -d freeepg --no-owner --no-acl \
  | gzip > "${BACKUP_DIR}/freeepg-pg-${TIMESTAMP}.sql.gz"

echo "[backup] EPG volume archive → ${BACKUP_DIR}/freeepg-epg-data-${TIMESTAMP}.tar.gz"
docker run --rm \
  -v freeepg_epg-data:/data:ro \
  -v "${BACKUP_DIR}:/backup" \
  alpine:3.21 \
  tar -czf "/backup/freeepg-epg-data-${TIMESTAMP}.tar.gz" -C /data .

echo "[backup] Done. Retention: prune local files older than ${BACKUP_RETENTION_DAYS:-14} days."
find "${BACKUP_DIR}" -type f \( -name 'freeepg-pg-*.sql.gz' -o -name 'freeepg-epg-data-*.tar.gz' \) \
  -mtime "+${BACKUP_RETENTION_DAYS:-14}" -delete

echo "[backup] Restore hint:"
echo "  gunzip -c ${BACKUP_DIR}/freeepg-pg-${TIMESTAMP}.sql.gz | docker compose ... exec -T postgres psql -U freeepg -d freeepg"
echo "  docker run --rm -v freeepg_epg-data:/data -v ${BACKUP_DIR}:/backup alpine tar -xzf /backup/freeepg-epg-data-${TIMESTAMP}.tar.gz -C /data"
