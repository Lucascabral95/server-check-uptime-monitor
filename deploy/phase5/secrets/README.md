# Production secrets

The compose stack expects these files in this directory:

- `postgres.env`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- `redis.env`: `REDIS_PASSWORD`.
- `backend.env`: complete backend configuration, including `DATABASE_URL` pointing to `postgres`.
- `caddy.env`: `PUBLIC_DOMAIN` with the public DNS name.
- `grafana_admin_password`: one long random password (one line).
- `s3.env` (optional): credentials consumed by the backup upload job.
- `bootstrap.env.example`: names the values consumed by the bootstrap script; keep the real file outside the repository.

Copy the `*.example` files, replace every placeholder, and restrict access:

```bash
chmod 700 deploy/phase5/secrets
chmod 600 deploy/phase5/secrets/*.{env,env.example} deploy/phase5/secrets/grafana_admin_password
```

Use URL-safe characters (`A-Z`, `a-z`, `0-9`, `-`, `_`) for the PostgreSQL password because it is embedded in
`DATABASE_URL`; use a different value for Redis. Generate all other secrets with a password manager or a cryptographically
secure generator.

Never use development credentials in production. The repository only contains templates; real values must be injected by the
deployment secret manager or created directly on the VPS.
