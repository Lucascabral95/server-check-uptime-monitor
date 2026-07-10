CREATE TYPE "ProbeAssignmentStatus" AS ENUM ('PENDING', 'LEASED', 'COMPLETED', 'FAILED');
CREATE TABLE "probe_assignments" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "run_id" TEXT NOT NULL,
  "monitor_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'GET',
  "timeout_ms" INTEGER NOT NULL DEFAULT 10000,
  "status" "ProbeAssignmentStatus" NOT NULL DEFAULT 'PENDING',
  "leased_until" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "probe_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "probe_assignments_run_id_agent_id_key" ON "probe_assignments"("run_id", "agent_id");
CREATE INDEX "probe_assignments_agent_id_status_leased_until_idx" ON "probe_assignments"("agent_id", "status", "leased_until");
ALTER TABLE "probe_assignments" ADD CONSTRAINT "probe_assignments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "probe_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "probe_assignments" ADD CONSTRAINT "probe_assignments_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
