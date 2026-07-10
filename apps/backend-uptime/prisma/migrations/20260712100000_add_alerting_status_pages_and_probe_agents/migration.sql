CREATE TYPE "NotificationChannelType" AS ENUM ('EMAIL', 'SLACK', 'WEBHOOK');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "IncidentLifecycle" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');

ALTER TABLE "incidents" ADD COLUMN "severity" "AlertSeverity" NOT NULL DEFAULT 'CRITICAL';
ALTER TABLE "incidents" ADD COLUMN "lifecycle" "IncidentLifecycle" NOT NULL DEFAULT 'INVESTIGATING';
ALTER TABLE "incidents" ADD COLUMN "acknowledged_at" TIMESTAMP(3);
ALTER TABLE "incidents" ADD COLUMN "acknowledged_by_id" TEXT;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "notification_channels" (
  "id" TEXT NOT NULL, "workspace_id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "type" "NotificationChannelType" NOT NULL, "config" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notification_channels_workspace_id_enabled_idx" ON "notification_channels"("workspace_id", "enabled");
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "alert_policies" (
  "id" TEXT NOT NULL, "workspace_id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "severity" "AlertSeverity" NOT NULL DEFAULT 'CRITICAL', "monitor_ids" JSONB NOT NULL,
  "cooldown_seconds" INTEGER NOT NULL DEFAULT 300, "recovery_enabled" BOOLEAN NOT NULL DEFAULT true,
  "enabled" BOOLEAN NOT NULL DEFAULT true, "monitor_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "alert_policies_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "alert_policies_workspace_id_enabled_idx" ON "alert_policies"("workspace_id", "enabled");
ALTER TABLE "alert_policies" ADD CONSTRAINT "alert_policies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_policies" ADD CONSTRAINT "alert_policies_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "_AlertPolicyToNotificationChannel" (
  "A" TEXT NOT NULL, "B" TEXT NOT NULL,
  CONSTRAINT "_AlertPolicyToNotificationChannel_AB_pkey" PRIMARY KEY ("A", "B")
);
CREATE INDEX "_AlertPolicyToNotificationChannel_B_index" ON "_AlertPolicyToNotificationChannel"("B");
ALTER TABLE "_AlertPolicyToNotificationChannel" ADD CONSTRAINT "_AlertPolicyToNotificationChannel_A_fkey" FOREIGN KEY ("A") REFERENCES "alert_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_AlertPolicyToNotificationChannel" ADD CONSTRAINT "_AlertPolicyToNotificationChannel_B_fkey" FOREIGN KEY ("B") REFERENCES "notification_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notification_deliveries" (
  "id" TEXT NOT NULL, "channel_id" TEXT NOT NULL, "policy_id" TEXT, "monitor_id" TEXT, "incident_id" TEXT,
  "idempotency_key" TEXT NOT NULL, "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0, "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB NOT NULL, "last_error" TEXT, "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_deliveries_idempotency_key_key" ON "notification_deliveries"("idempotency_key");
CREATE INDEX "notification_deliveries_status_next_attempt_at_idx" ON "notification_deliveries"("status", "next_attempt_at");
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "notification_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "alert_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "incident_comments" (
  "id" TEXT NOT NULL, "incident_id" TEXT NOT NULL, "author_id" TEXT NOT NULL, "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "incident_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "incident_comments_incident_id_created_at_idx" ON "incident_comments"("incident_id", "created_at");
ALTER TABLE "incident_comments" ADD CONSTRAINT "incident_comments_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incident_comments" ADD CONSTRAINT "incident_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "incident_timeline" (
  "id" TEXT NOT NULL, "incident_id" TEXT NOT NULL, "actor_id" TEXT, "event" TEXT NOT NULL, "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "incident_timeline_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "incident_timeline_incident_id_created_at_idx" ON "incident_timeline"("incident_id", "created_at");
ALTER TABLE "incident_timeline" ADD CONSTRAINT "incident_timeline_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incident_timeline" ADD CONSTRAINT "incident_timeline_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "status_pages" (
  "id" TEXT NOT NULL, "workspace_id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
  "description" TEXT, "is_published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "status_pages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "status_pages_slug_key" ON "status_pages"("slug");
ALTER TABLE "status_pages" ADD CONSTRAINT "status_pages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "status_page_components" (
  "id" TEXT NOT NULL, "status_page_id" TEXT NOT NULL, "monitor_id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "status_page_components_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "status_page_components_status_page_id_monitor_id_key" ON "status_page_components"("status_page_id", "monitor_id");
ALTER TABLE "status_page_components" ADD CONSTRAINT "status_page_components_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "status_page_components" ADD CONSTRAINT "status_page_components_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "status_page_subscribers" (
  "id" TEXT NOT NULL, "status_page_id" TEXT NOT NULL, "email" TEXT NOT NULL, "token_hash" TEXT NOT NULL,
  "confirmed_at" TIMESTAMP(3), "unsubscribed_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "status_page_subscribers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "status_page_subscribers_token_hash_key" ON "status_page_subscribers"("token_hash");
CREATE UNIQUE INDEX "status_page_subscribers_status_page_id_email_key" ON "status_page_subscribers"("status_page_id", "email");
ALTER TABLE "status_page_subscribers" ADD CONSTRAINT "status_page_subscribers_status_page_id_fkey" FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "probe_agents" (
  "id" TEXT NOT NULL, "workspace_id" TEXT, "name" TEXT NOT NULL, "region" TEXT NOT NULL, "version" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT true, "last_seen_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "probe_agents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "probe_agents_region_key" ON "probe_agents"("region");
CREATE UNIQUE INDEX "probe_agents_token_hash_key" ON "probe_agents"("token_hash");
ALTER TABLE "probe_agents" ADD CONSTRAINT "probe_agents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "agent_heartbeats" (
  "id" TEXT NOT NULL, "agent_id" TEXT NOT NULL, "version" TEXT NOT NULL, "queue_lag_ms" INTEGER NOT NULL DEFAULT 0,
  "capacity" INTEGER NOT NULL DEFAULT 0, "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_heartbeats_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "agent_heartbeats_agent_id_received_at_idx" ON "agent_heartbeats"("agent_id", "received_at" DESC);
ALTER TABLE "agent_heartbeats" ADD CONSTRAINT "agent_heartbeats_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "probe_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "slo_targets" (
  "id" TEXT NOT NULL, "monitor_id" TEXT NOT NULL, "target" DECIMAL(5,3) NOT NULL, "period_days" INTEGER NOT NULL DEFAULT 30,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "slo_targets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "slo_targets_monitor_id_period_days_key" ON "slo_targets"("monitor_id", "period_days");
ALTER TABLE "slo_targets" ADD CONSTRAINT "slo_targets_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
