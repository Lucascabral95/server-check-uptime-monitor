-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('ONGOING', 'RESOLVED');

-- DropIndex
DROP INDEX "monitors_is_active_next_check_idx";

-- AlterTable
ALTER TABLE "monitors" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ping_logs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'ONGOING',
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "first_status_code" INTEGER,
    "first_error" TEXT,
    "last_error" TEXT,
    "affected_checks" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incidents_monitor_id_started_at_idx" ON "incidents"("monitor_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "incidents_user_id_started_at_idx" ON "incidents"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "incidents_user_id_status_idx" ON "incidents"("user_id", "status");

-- CreateIndex
CREATE INDEX "monitors_user_id_created_at_idx" ON "monitors"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "monitors_user_id_is_active_status_idx" ON "monitors"("user_id", "is_active", "status");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (partial unique index — Prisma's schema DSL can't express a
-- WHERE clause on an index, so it's hand-added here; see the comment above
-- the Incident model in schema.prisma). Guarantees at most one ONGOING
-- incident per monitor, which is what makes the CAS write in
-- uptime.processor.ts safe under concurrency.
CREATE UNIQUE INDEX "incidents_one_ongoing_per_monitor" ON "incidents" ("monitor_id") WHERE "status" = 'ONGOING';
