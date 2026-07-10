# WireGuard key material

Generate keys on the VPS with:

```bash
./scripts/generate-wireguard-keys.sh deploy/phase5/wireguard
```

Only public keys belong in the WireGuard peer configuration. Keep `*.key` files on the host, set mode `600`, and never commit
them. The tunnel should allow only the probe-agent/API ports required by the deployment; PostgreSQL and Redis remain bound to
the Docker internal network.
