import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly httpRequests = new Counter({
    name: 'server_check_http_requests_total',
    help: 'HTTP requests handled',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });
  readonly httpDuration = new Histogram({
    name: 'server_check_http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
    registers: [this.registry],
  });
  readonly queueDepth = new Gauge({
    name: 'server_check_queue_depth',
    help: 'BullMQ queue depth',
    labelNames: ['queue'],
    registers: [this.registry],
  });
  readonly probeHeartbeat = new Gauge({
    name: 'server_check_probe_heartbeat_timestamp_seconds',
    help: 'Last probe heartbeat timestamp',
    labelNames: ['region'],
    registers: [this.registry],
  });
  readonly notificationFailures = new Counter({
    name: 'server_check_notification_failures_total',
    help: 'Failed notification deliveries',
    labelNames: ['channel_type'],
    registers: [this.registry],
  });
  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'server_check_' });
  }
  metrics() {
    return this.registry.metrics();
  }
}
