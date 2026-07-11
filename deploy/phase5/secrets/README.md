# Production secrets

The Compose stack expects the following real files in this directory. They are ignored by Git and must be readable only by the deployment user.

- `postgres.env`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.
- `redis.env`: `REDIS_PASSWORD`.
- `backend.env`: all required runtime configuration for the NestJS application.
- `grafana_admin_password`: one long random password on a single line.
- `s3.env`: AWS backup bucket, prefix, and region; the EC2 IAM role supplies credentials.
- `bootstrap.env`: input for `scripts/bootstrap-production-secrets.sh`; it is only needed while generating the other files.

Create `bootstrap.env` from `bootstrap.env.example`, populate it outside shell history, then run:

```bash
set -a
. deploy/phase5/secrets/bootstrap.env
set +a
sh ./scripts/bootstrap-production-secrets.sh
```

The AWS deployment command writes the runtime files automatically. The preflight script rejects placeholders, missing required values, symlinks, and files readable by group or other users.

```bash
chmod 700 deploy/phase5/secrets
chmod 600 deploy/phase5/secrets/*.env deploy/phase5/secrets/grafana_admin_password
```

Use URL-safe characters (`A-Z`, `a-z`, `0-9`, `-`, `_`) for the PostgreSQL password because it is embedded in `DATABASE_URL`; use a different value for Redis. Never use development credentials in production.
