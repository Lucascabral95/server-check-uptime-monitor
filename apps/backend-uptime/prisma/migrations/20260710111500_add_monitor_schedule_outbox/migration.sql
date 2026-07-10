-- CreateTable
CREATE TABLE "monitor_schedule_outbox" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMP(3),
    "locked_until" TIMESTAMP(3),
    "locked_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitor_schedule_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monitor_schedule_outbox_processed_at_available_at_locked_until_idx"
ON "monitor_schedule_outbox"("processed_at", "available_at", "locked_until");

-- CreateIndex
CREATE INDEX "monitor_schedule_outbox_monitor_id_idx"
ON "monitor_schedule_outbox"("monitor_id");
