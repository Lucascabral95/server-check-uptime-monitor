# Database restore

Announce maintenance, stop API and workers, restore the encrypted PostgreSQL dump into an isolated instance, run `prisma migrate deploy`, validate workspace isolation and monitor counts, then switch the connection secret and restart. Record measured RPO/RTO and keep the original database read-only until verification is complete.
