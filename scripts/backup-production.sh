#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_DIR="${REPOSITORY_DIR:-$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPOSITORY_DIR/deploy/phase5/docker-compose.production.yml}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$REPOSITORY_DIR/deploy/phase5/.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/server-check}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required"
}

compose() {
  docker compose --env-file "$DEPLOY_ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

require_command docker
require_command gzip
test -f "$COMPOSE_FILE" || fail "Missing Compose file: $COMPOSE_FILE"
test -f "$DEPLOY_ENV_FILE" || fail "Missing deployment environment file: $DEPLOY_ENV_FILE"

umask 077
mkdir -p "$BACKUP_DIR"
temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/server-check-backup.XXXXXX")
trap 'rm -rf "$temporary_directory"' EXIT HUP INT TERM

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
postgres_backup="$BACKUP_DIR/postgres-$timestamp.sql.gz"
redis_backup="$BACKUP_DIR/redis-$timestamp.rdb.gz"

compose exec -T postgres sh -ec \
  'PGPASSWORD="$POSTGRES_PASSWORD" exec pg_dump --format=plain --no-owner --no-privileges --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  | gzip -9 > "$postgres_backup"

compose exec -T redis sh -ec '
  dump_file=/tmp/server-check-backup.rdb
  redis-cli --no-auth-warning -a "$REDIS_PASSWORD" --rdb "$dump_file" >/dev/null
  cat "$dump_file"
  rm -f "$dump_file"
' | gzip -9 > "$redis_backup"

BACKUP_DIR="$BACKUP_DIR" sh "$SCRIPT_DIR/upload-backups-s3.sh"
find "$BACKUP_DIR" -type f -name '*.gz' -mtime "+$BACKUP_RETENTION_DAYS" -delete

printf 'Uploaded backups: %s and %s\n' "$postgres_backup" "$redis_backup"
