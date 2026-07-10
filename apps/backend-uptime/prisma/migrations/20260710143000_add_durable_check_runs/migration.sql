-- CreateEnum
CREATE TYPE "CheckRunStatus" AS ENUM ('PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "check_runs" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "status" "CheckRunStatus" NOT NULL DEFAULT 'PROCESSING',
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_runs_pkey" PRIMARY KEY ("id")
);

-- Add idempotency key to legacy ping logs. Existing rows remain valid.
ALTER TABLE "ping_logs" ADD COLUMN "run_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "check_runs_run_id_key" ON "check_runs"("run_id");
CREATE INDEX "check_runs_monitor_id_started_at_idx" ON "check_runs"("monitor_id", "started_at" DESC);
CREATE INDEX "check_runs_status_started_at_idx" ON "check_runs"("status", "started_at");
CREATE UNIQUE INDEX "ping_logs_run_id_key" ON "ping_logs"("run_id");
