# Phase 5 production operation

Copy `deploy/phase5/.env.example` to `.env`, then inject bootstrap values from your secret manager (not shell history) and
run `./scripts/bootstrap-production-secrets.sh`.
Run `./scripts/validate-production-config.sh` before starting Compose. Never commit those files.

The edge network exposes only Caddy. PostgreSQL, Redis, Prometheus, Grafana and Loki belong to the internal network. Configure the host firewall to allow TCP 80/443 and SSH/WireGuard only; do not publish database or Redis ports.

Start the observability stack:

```bash
docker compose --env-file deploy/phase5/.env -f deploy/phase5/docker-compose.production.yml up -d
```

Point the domain's DNS A/AAAA records at the public VPS before starting Caddy. Caddy obtains and renews TLS automatically; the
firewall should expose only TCP 80/443, SSH, and the WireGuard UDP port.

Backups are encrypted locally with `age`, then uploaded to any S3-compatible provider with
`AWS_ENDPOINT_URL`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` passed to
`scripts/upload-backups-s3.sh`. Create a bucket with private ACLs, versioning, lifecycle retention, and a dedicated write-only
access key.

Schedule `backup-postgres.sh` and `backup-redis.sh` before the upload script (for example with a systemd timer), and perform a
monthly restore drill using the runbooks under `docs/runbooks/`.
