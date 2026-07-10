#!/usr/bin/env sh
set -eu

: "${AWS_S3_BUCKET:?AWS_S3_BUCKET is required}"
: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID is required}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY is required}"
: "${AWS_REGION:?AWS_REGION is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/server-check}"
S3_PREFIX="${S3_PREFIX:-${AWS_S3_PREFIX:-server-check/$(hostname)}}"

command -v aws >/dev/null 2>&1 || { printf 'aws CLI is required\n' >&2; exit 1; }
test -d "$BACKUP_DIR" || { printf 'Backup directory does not exist: %s\n' "$BACKUP_DIR" >&2; exit 1; }

aws_args="--region $AWS_REGION"
if [ -n "${AWS_ENDPOINT_URL:-}" ]; then
  aws_args="$aws_args --endpoint-url $AWS_ENDPOINT_URL"
fi

# shellcheck disable=SC2086
aws s3 sync "$BACKUP_DIR" "s3://$AWS_S3_BUCKET/$S3_PREFIX" $aws_args --only-show-errors
