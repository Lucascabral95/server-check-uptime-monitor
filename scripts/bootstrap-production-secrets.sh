#!/usr/bin/env sh
set -eu

SECRETS_DIR="${SECRETS_DIR:-deploy/phase5/secrets}"
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:?PUBLIC_DOMAIN is required}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
REDIS_PASSWORD="${REDIS_PASSWORD:?REDIS_PASSWORD is required}"
SECRET_JWT="${SECRET_JWT:?SECRET_JWT is required}"
MONITOR_SECRETS_KEY="${MONITOR_SECRETS_KEY:?MONITOR_SECRETS_KEY is required}"
COGNITO_ISSUER="${COGNITO_ISSUER:?COGNITO_ISSUER is required}"
COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID:?COGNITO_CLIENT_ID is required}"
GRAFANA_ADMIN_PASSWORD="${GRAFANA_ADMIN_PASSWORD:?GRAFANA_ADMIN_PASSWORD is required}"

case "$POSTGRES_PASSWORD" in
  *[!A-Za-z0-9_-]*|"")
    printf 'POSTGRES_PASSWORD must contain only URL-safe characters (A-Z, a-z, 0-9, -, _)\n' >&2
    exit 1
    ;;
esac

case "$PUBLIC_DOMAIN" in
  *[!A-Za-z0-9.-]*|""|.*|*.)
    printf 'PUBLIC_DOMAIN must be a DNS hostname without a scheme or path\n' >&2
    exit 1
    ;;
esac

umask 077
mkdir -p "$SECRETS_DIR"

cat > "$SECRETS_DIR/postgres.env" <<EOF
POSTGRES_USER=servercheck
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=servercheck
EOF

cat > "$SECRETS_DIR/redis.env" <<EOF
REDIS_PASSWORD=$REDIS_PASSWORD
EOF

cat > "$SECRETS_DIR/backend.env" <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://servercheck:$POSTGRES_PASSWORD@postgres:5432/servercheck?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
SECRET_JWT=$SECRET_JWT
MONITOR_SECRETS_KEY=$MONITOR_SECRETS_KEY
COGNITO_ISSUER=$COGNITO_ISSUER
COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
MY_URL_FRONTEND=https://$PUBLIC_DOMAIN
OTEL_ENABLED=${OTEL_ENABLED:-false}
OTEL_SERVICE_NAME=server-check-api
OTEL_EXPORTER_OTLP_ENDPOINT=${OTEL_EXPORTER_OTLP_ENDPOINT:-http://otel-collector:4318}
EOF

cat > "$SECRETS_DIR/caddy.env" <<EOF
PUBLIC_DOMAIN=$PUBLIC_DOMAIN
EOF

printf '%s\n' "$GRAFANA_ADMIN_PASSWORD" > "$SECRETS_DIR/grafana_admin_password"
printf 'Created production secret files in %s\n' "$SECRETS_DIR"
