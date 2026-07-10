-- Additive Fase 2: recurrent maintenance windows and durable aggregates.
CREATE TABLE "maintenance_windows" (
  "id" TEXT NOT NULL,
  "monitor_id" TEXT NOT NULL,
  "days_of_week" INTEGER[] NOT NULL,
  "start_minute" INTEGER NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_windows_monitor_id_enabled_idx" ON "maintenance_windows"("monitor_id", "enabled");
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_monitor_id_fkey"
  FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "AggregateGranularity" AS ENUM ('HOURLY', 'DAILY');
CREATE TABLE "monitor_aggregates" (
  "id" TEXT NOT NULL,
  "monitor_id" TEXT NOT NULL,
  "granularity" "AggregateGranularity" NOT NULL,
  "bucket_start" TIMESTAMP(3) NOT NULL,
  "checks" INTEGER NOT NULL DEFAULT 0,
  "successes" INTEGER NOT NULL DEFAULT 0,
  "failures" INTEGER NOT NULL DEFAULT 0,
  "total_duration_ms" BIGINT NOT NULL DEFAULT 0,
  "downtime_ms" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "monitor_aggregates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "monitor_aggregates_monitor_id_granularity_bucket_start_key"
  ON "monitor_aggregates"("monitor_id", "granularity", "bucket_start");
CREATE INDEX "monitor_aggregates_monitor_id_granularity_bucket_start_idx"
  ON "monitor_aggregates"("monitor_id", "granularity", "bucket_start" DESC);
ALTER TABLE "monitor_aggregates" ADD CONSTRAINT "monitor_aggregates_monitor_id_fkey"
  FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
