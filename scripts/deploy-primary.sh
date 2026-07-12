#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_DIR="${REPOSITORY_DIR:-$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPOSITORY_DIR/deploy/phase5/docker-compose.production.yml}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$REPOSITORY_DIR/deploy/phase5/.env}"
SECRETS_DIR="${SECRETS_DIR:-$REPOSITORY_DIR/deploy/phase5/secrets}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-180}"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required"
}

compose() {
  # SSM RunCommand caps captured stdout+stderr at 24,000 characters combined; the default
  # "auto" progress renderer prints a line per image layer/build step when not attached to
  # a TTY (which is always true under SSM), easily producing thousands of lines and pushing
  # the real pass/fail result past that cap. Quiet progress keeps the run legible while still
  # surfacing genuine build/pull errors.
  docker compose --progress quiet --env-file "$DEPLOY_ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

env_value() {
  key="$1"
  awk -v key="$key" '
    index($0, key "=") == 1 {
      print substr($0, length(key) + 2)
      exit
    }
  ' "$DEPLOY_ENV_FILE"
}

wait_for_healthy() {
  service="$1"
  elapsed=0

  while test "$elapsed" -lt "$WAIT_TIMEOUT_SECONDS"; do
    container_id=$(compose ps -q "$service")
    if test -n "$container_id"; then
      status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)
      case "$status" in
        healthy)
          return 0
          ;;
        unhealthy|exited|dead)
          compose logs --tail 100 "$service" >&2 || true
          fail "$service did not become healthy (status: $status)"
          ;;
      esac
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  compose logs --tail 100 "$service" >&2 || true
  fail "Timed out waiting for $service to become healthy"
}

wait_for_public_readiness() {
  elapsed=0

  while test "$elapsed" -lt "$WAIT_TIMEOUT_SECONDS"; do
    if curl --fail --silent --show-error --max-time 10 \
      http://127.0.0.1/health/readiness >/dev/null; then
      return 0
    fi
    sleep 3
    elapsed=$((elapsed + 3))
  done

  compose logs --tail 100 caddy backend-uptime >&2 || true
  fail 'Timed out waiting for Caddy to serve /health/readiness'
}

require_command docker
require_command curl
test -f "$COMPOSE_FILE" || fail "Missing Compose file: $COMPOSE_FILE"
test -f "$DEPLOY_ENV_FILE" || fail "Missing deployment environment file: $DEPLOY_ENV_FILE"

SECRETS_DIR="$SECRETS_DIR" DEPLOY_ENV_FILE="$DEPLOY_ENV_FILE" \
  sh "$SCRIPT_DIR/validate-production-config.sh"
compose config --quiet

compose up -d postgres redis
wait_for_healthy postgres
wait_for_healthy redis

printf 'Running database migrations\n'
compose run --rm --no-deps --build migrate

compose up -d prometheus loki tempo otel-collector alloy grafana
compose up -d --build --no-deps backend-uptime
wait_for_healthy backend-uptime

compose up -d --build --no-deps web
wait_for_healthy web


# `up -d` alone is a no-op here when only the bind-mounted Caddyfile content
# changed: compose's change detection hashes the service config, not mounted
# file contents, so a stale Caddy process would keep running with its old
# in-memory config. Force recreation so Caddy always restarts and re-reads
# the current file.
compose up -d --force-recreate --no-deps caddy

wait_for_public_readiness

printf 'Primary deployment completed successfully\n'
