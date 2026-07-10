# Redis loss

Redis is a scheduler/notification transport, not the source of truth. Stop workers, restore Redis AOF/RDB if available, run queue synchronization, and verify pending notification deliveries and monitor assignments are replayed from PostgreSQL. Do not delete PostgreSQL rows to recover queue state.
