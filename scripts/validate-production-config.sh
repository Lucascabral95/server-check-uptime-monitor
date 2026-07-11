#!/usr/bin/env sh
set -eu

SECRETS_DIR="${SECRETS_DIR:-deploy/phase5/secrets}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-deploy/phase5/.env}"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

env_value() {
  key="$1"
  file="$2"
  awk -v key="$key" '
    index($0, key "=") == 1 {
      value = substr($0, length(key) + 2)
      sub(/\r$/, "", value)
      if (value ~ /^".*"$/) {
        sub(/^"/, "", value)
        sub(/"$/, "", value)
      }
      print value
      exit
    }
  ' "$file"
}

require_env_value() {
  key="$1"
  file="$2"
  value=$(env_value "$key" "$file")
  test -n "$value" || fail "Missing or empty $key in $file"
}

require_secret_file() {
  path="$1"
  test -f "$path" || fail "Missing $path"
  test ! -L "$path" || fail "Secret must not be a symlink: $path"
  if find "$path" -maxdepth 0 -perm /077 -print -quit | grep -q .; then
    fail "Secret file must not be readable by group or other users: $path"
  fi
}

test -f "$DEPLOY_ENV_FILE" || fail "Missing $DEPLOY_ENV_FILE"
test ! -L "$DEPLOY_ENV_FILE" || fail "Deployment environment file must not be a symlink: $DEPLOY_ENV_FILE"

for file in postgres.env redis.env backend.env grafana_admin_password s3.env; do
  require_secret_file "$SECRETS_DIR/$file"
done

for file in "$DEPLOY_ENV_FILE" "$SECRETS_DIR"/*.env "$SECRETS_DIR/grafana_admin_password"; do
  if grep -qiE 'replace-with|example\.com|changeme|password123|thisismysecret' "$file"; then
    fail "Placeholder value detected in $file"
  fi
done

for key in PUBLIC_ORIGIN NEXT_PUBLIC_COGNITO_USER_POOL_ID NEXT_PUBLIC_COGNITO_CLIENT_ID; do
  require_env_value "$key" "$DEPLOY_ENV_FILE"
done

for key in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB; do
  require_env_value "$key" "$SECRETS_DIR/postgres.env"
done

require_env_value REDIS_PASSWORD "$SECRETS_DIR/redis.env"

for key in \
  NODE_ENV DATABASE_URL POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB REDIS_HOST REDIS_PORT REDIS_PASSWORD \
  SECRET_JWT MONITOR_SECRETS_KEY COGNITO_ISSUER COGNITO_CLIENT_ID MY_URL_FRONTEND AWS_REGION \
  AWS_SES_FROM_EMAIL; do
  require_env_value "$key" "$SECRETS_DIR/backend.env"
done

for key in AWS_S3_BUCKET AWS_REGION; do
  require_env_value "$key" "$SECRETS_DIR/s3.env"
done

public_origin=$(env_value PUBLIC_ORIGIN "$DEPLOY_ENV_FILE")
case "$public_origin" in
  https://*.cloudfront.net) ;;
  *) fail 'PUBLIC_ORIGIN must be an HTTPS CloudFront domain' ;;
esac

test "$(wc -c < "$SECRETS_DIR/grafana_admin_password")" -ge 24 || {
  fail 'Grafana password must be at least 24 bytes'
}

printf 'Production configuration passed secret, permission, and placeholder checks\n'
