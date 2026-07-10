# Server Check Contracts

Versioned Zod schemas shared by the API, workers, and frontend. Events must
include an `eventId`, version, timestamp, workspace context, and idempotency
key before they cross a process or queue boundary.
