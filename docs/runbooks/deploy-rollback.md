# Deploy and rollback

1. Verify the target image digest and run database migrations with `prisma migrate deploy`.
2. Start the new stack with Compose and wait for `/health/readiness` to return 200.
3. Check `/metrics`, queue depth, probe heartbeats and notification failures.
4. Keep the previous image available until smoke checks pass.

Rollback is `docker compose up -d --no-build` with the previous image tag. Never roll back a migration automatically; use an additive forward migration or restore the database backup after declaring an incident.
