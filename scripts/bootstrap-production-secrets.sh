#!/usr/bin/env sh
set -eu

SECRETS_DIR="${SECRETS_DIR:-deploy/phase5/secrets}"

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${REDIS_PASSWORD:?REDIS_PASSWORD is required}"
: "${SECRET_JWT:?SECRET_JWT is required}"
: "${MONITOR_SECRETS_KEY:?MONITOR_SECRETS_KEY is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_SES_FROM_EMAIL:?AWS_SES_FROM_EMAIL is required}"
: "${GRAFANA_ADMIN_PASSWORD:?GRAFANA_ADMIN_PASSWORD is required}"

case "$POSTGRES_PASSWORD" in
  *[!A-Za-z0-9_-]*|"")
    printf 'POSTGRES_PASSWORD must contain only URL-safe characters (A-Z, a-z, 0-9, -, _)\n' >&2
    exit 1
    ;;
esac

write_env_value() {
  key="$1"
  value="$2"
  escaped_value=$(printf '%s' "$value" | sed 's/[\\"]/\\&/g')
  printf '%s="%s"\n' "$key" "$escaped_value"
}

umask 077
mkdir -p "$SECRETS_DIR"

{
  write_env_value POSTGRES_USER "$POSTGRES_USER"
  write_env_value POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
  write_env_value POSTGRES_DB "$POSTGRES_DB"
} > "$SECRETS_DIR/postgres.env"

write_env_value REDIS_PASSWORD "$REDIS_PASSWORD" > "$SECRETS_DIR/redis.env"

{
  write_env_value NODE_ENV production
  write_env_value PORT 4000
  write_env_value DATABASE_URL "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_DB?schema=public"
  write_env_value POSTGRES_USER "$POSTGRES_USER"
  write_env_value POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
  write_env_value POSTGRES_DB "$POSTGRES_DB"
  write_env_value REDIS_HOST redis
  write_env_value REDIS_PORT 6379
  write_env_value REDIS_PASSWORD "$REDIS_PASSWORD"
  write_env_value SECRET_JWT "$SECRET_JWT"
  write_env_value MONITOR_SECRETS_KEY "$MONITOR_SECRETS_KEY"
  write_env_value AWS_REGION "$AWS_REGION"
  write_env_value AWS_SES_FROM_EMAIL "$AWS_SES_FROM_EMAIL"
  write_env_value GMAIL_APP_USER "${GMAIL_APP_USER:-}"
  write_env_value GMAIL_APP_PASSWORD "${GMAIL_APP_PASSWORD:-}"
  write_env_value OTEL_ENABLED "${OTEL_ENABLED:-true}"
  write_env_value OTEL_SERVICE_NAME server-check-api
  write_env_value OTEL_EXPORTER_OTLP_ENDPOINT "${OTEL_EXPORTER_OTLP_ENDPOINT:-http://otel-collector:4318}"
} > "$SECRETS_DIR/backend.env"

printf '%s\n' "$GRAFANA_ADMIN_PASSWORD" > "$SECRETS_DIR/grafana_admin_password"

printf 'Created production secret files in %s\n' "$SECRETS_DIR"
