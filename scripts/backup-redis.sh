#!/usr/bin/env sh
set -eu
: "${REDIS_URL:?REDIS_URL is required}"
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/server-check}"
mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/redis-$(date -u +%Y%m%dT%H%M%SZ).rdb.age"
tmp="${file%.age}"
redis-cli -u "$REDIS_URL" --rdb "$tmp"
age -r "$BACKUP_AGE_RECIPIENT" -o "$file" "$tmp"
rm -f "$tmp"
find "$BACKUP_DIR" -type f -name 'redis-*.age' -mtime +30 -delete
echo "$file"
