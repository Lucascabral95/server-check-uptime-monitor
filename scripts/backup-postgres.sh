#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/server-check}"
mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/postgres-$(date -u +%Y%m%dT%H%M%SZ).sql.gz.age"
pg_dump --format=plain --no-owner --no-privileges "$DATABASE_URL" | gzip -9 | age -r "$BACKUP_AGE_RECIPIENT" -o "$file"
find "$BACKUP_DIR" -type f -name 'postgres-*.age' -mtime +30 -delete
echo "$file"
