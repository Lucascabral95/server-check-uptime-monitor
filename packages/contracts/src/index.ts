import { z } from "zod";

export const eventEnvelopeSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string().min(1),
  version: z.number().int().positive(),
  occurredAt: z.coerce.date(),
  workspaceId: z.string().uuid().nullable(),
  idempotencyKey: z.string().min(1),
});

export const monitorScheduleChangedSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("MonitorScheduleChanged"),
  monitorId: z.string().uuid(),
  action: z.enum(["created", "updated", "deleted"]),
  frequencySeconds: z.number().int().positive().nullable(),
  isActive: z.boolean(),
});

export const checkRequestedSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("CheckRequested"),
  monitorId: z.string().uuid(),
  runId: z.string().min(1),
  region: z.string().min(1),
});

export const probeResultReceivedSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("ProbeResultReceived"),
  monitorId: z.string().uuid(),
  runId: z.string().min(1),
  region: z.string().min(1),
  success: z.boolean(),
  statusCode: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  error: z.string().nullable(),
});

export const versionedEventSchema = z.discriminatedUnion("eventType", [
  monitorScheduleChangedSchema,
  checkRequestedSchema,
  probeResultReceivedSchema,
]);

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type MonitorScheduleChanged = z.infer<
  typeof monitorScheduleChangedSchema
>;
export type CheckRequested = z.infer<typeof checkRequestedSchema>;
export type ProbeResultReceived = z.infer<typeof probeResultReceivedSchema>;
export type VersionedEvent = z.infer<typeof versionedEventSchema>;
