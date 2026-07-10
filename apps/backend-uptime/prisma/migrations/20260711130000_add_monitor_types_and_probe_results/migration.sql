-- Additive monitor capabilities. Existing monitors remain HTTP and PENDING/UP/DOWN.
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'DEGRADED';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'MAINTENANCE';
CREATE TYPE "MonitorType" AS ENUM ('HTTP', 'SSL', 'HEARTBEAT');

ALTER TABLE "monitors" ADD COLUMN "monitor_type" "MonitorType" NOT NULL DEFAULT 'HTTP';
ALTER TABLE "monitors" ADD COLUMN "config" JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "monitors" ADD COLUMN "consecutive_failures" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "monitors" ADD COLUMN "consecutive_successes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "monitors" ADD COLUMN "heartbeat_secret_hash" TEXT;
ALTER TABLE "monitors" ADD COLUMN "heartbeat_interval_seconds" INTEGER;
ALTER TABLE "monitors" ADD COLUMN "heartbeat_grace_seconds" INTEGER;
ALTER TABLE "monitors" ADD COLUMN "heartbeat_last_received_at" TIMESTAMP(3);
ALTER TABLE "monitors" ADD COLUMN "maintenance_until" TIMESTAMP(3);

ALTER TABLE "check_runs" ADD COLUMN "region" TEXT NOT NULL DEFAULT 'primary';
DROP INDEX IF EXISTS "check_runs_run_id_key";
CREATE UNIQUE INDEX "check_runs_run_id_region_key" ON "check_runs"("run_id", "region");

CREATE TABLE "probe_results" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "error" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "probe_results_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "monitors_heartbeat_secret_hash_key" ON "monitors"("heartbeat_secret_hash");
CREATE INDEX "monitors_monitor_type_is_active_idx" ON "monitors"("monitor_type", "is_active");
CREATE UNIQUE INDEX "probe_results_run_id_region_key" ON "probe_results"("run_id", "region");
CREATE INDEX "probe_results_monitor_id_checked_at_idx" ON "probe_results"("monitor_id", "checked_at" DESC);

ALTER TABLE "probe_results" ADD CONSTRAINT "probe_results_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
