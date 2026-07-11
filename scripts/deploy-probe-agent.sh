#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_DIR="${REPOSITORY_DIR:-$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPOSITORY_DIR/deploy/phase4/docker-compose.probe-agent.yml}"
AGENT_ENV_FILE="${AGENT_ENV_FILE:-$REPOSITORY_DIR/deploy/phase4/.env}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-90}"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

compose() {
  docker compose --env-file "$AGENT_ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

env_value() {
  key="$1"
  awk -v key="$key" '
    index($0, key "=") == 1 {
      value = substr($0, length(key) + 2)
      sub(/\r$/, "", value)
      print value
      exit
    }
  ' "$AGENT_ENV_FILE"
}

require_value() {
  key="$1"
  value=$(env_value "$key")
  test -n "$value" || fail "Missing or empty $key in $AGENT_ENV_FILE"
  case "$value" in
    replace-with*|*example.com*)
      fail "Placeholder value detected for $key"
      ;;
  esac
}

command -v docker >/dev/null 2>&1 || fail 'docker is required'
test -f "$COMPOSE_FILE" || fail "Missing Compose file: $COMPOSE_FILE"
test -f "$AGENT_ENV_FILE" || fail "Missing agent environment file: $AGENT_ENV_FILE"

for key in CONTROL_PLANE_URL PROBE_REGION PROBE_TOKEN; do
  require_value "$key"
done

compose config --quiet
started_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
compose up -d --build

elapsed=0
while test "$elapsed" -lt "$WAIT_TIMEOUT_SECONDS"; do
  container_id=$(compose ps -q probe-agent)
  if test -n "$container_id"; then
    status=$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)
    case "$status" in
      exited|dead)
        compose logs --tail 100 probe-agent >&2 || true
        fail "probe-agent stopped unexpectedly (status: $status)"
        ;;
      running)
        if compose logs --since "$started_at" --no-log-prefix probe-agent 2>&1 | grep -Fq '"event":"probe.heartbeat"'; then
          printf 'Probe agent is running and its heartbeat was accepted\n'
          exit 0
        fi
        ;;
    esac
  fi
  sleep 3
  elapsed=$((elapsed + 3))
done

compose logs --tail 100 probe-agent >&2 || true
fail 'Timed out waiting for a successful probe-agent heartbeat'
