# Backup and restore runbook

Backups run from a host with `pg_dump`, `redis-cli` and `age` installed. Store encrypted files in an S3-compatible bucket with versioning and lifecycle retention.

```bash
DATABASE_URL='postgresql://...' BACKUP_AGE_RECIPIENT='age1...' ./scripts/backup-postgres.sh
REDIS_URL='rediss://:password@redis:6379' BACKUP_AGE_RECIPIENT='age1...' ./scripts/backup-redis.sh
```

For a restore, decrypt into a temporary directory, restore PostgreSQL with `psql`, and replace Redis data only while Redis is stopped. Perform a monthly restore drill and record RPO/RTO in the deployment log. Target RPO is 15 minutes and RTO is 60 minutes.
