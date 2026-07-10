#!/usr/bin/env sh
set -eu

OUTPUT_DIR="${1:-deploy/phase5/wireguard}"
command -v wg >/dev/null 2>&1 || {
  printf 'wg is required (install wireguard-tools on the VPS)\n' >&2
  exit 1
}

umask 077
mkdir -p "$OUTPUT_DIR"
for name in primary secondary; do
  private="$OUTPUT_DIR/$name.key"
  public="$OUTPUT_DIR/$name.pub"
  test ! -e "$private" || { printf 'Refusing to overwrite %s\n' "$private" >&2; exit 1; }
  wg genkey > "$private"
  wg pubkey < "$private" > "$public"
done
printf 'Generated WireGuard keypairs in %s; keep private keys off git\n' "$OUTPUT_DIR"
