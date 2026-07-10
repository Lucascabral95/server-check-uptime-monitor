#!/usr/bin/env sh
set -eu

SECRETS_DIR="${SECRETS_DIR:-deploy/phase5/secrets}"
required="postgres.env redis.env backend.env caddy.env grafana_admin_password"

for file in $required; do
  path="$SECRETS_DIR/$file"
  test -f "$path" || { printf 'Missing %s\n' "$path" >&2; exit 1; }
  test ! -L "$path" || { printf 'Secret must not be a symlink: %s\n' "$path" >&2; exit 1; }
done

for file in $required; do
  if grep -niE 'replace-with|example\.com|changeme|password123|thisismysecret' "$SECRETS_DIR/$file"; then
    printf 'Placeholder value detected in production secrets\n' >&2
    exit 1
  fi
done

test "$(wc -c < "$SECRETS_DIR/grafana_admin_password")" -ge 24 || {
  printf 'Grafana password must be at least 24 bytes\n' >&2
  exit 1
}

printf 'Production configuration passed placeholder and file checks\n'
