import { Injectable, Logger } from '@nestjs/common';
export interface PlatformAlert {
  key: string;
  severity: 'warning' | 'critical';
  message: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  resolvedAt?: Date;
}
@Injectable()
export class InternalAlertService {
  private readonly logger = new Logger(InternalAlertService.name);
  private readonly alerts = new Map<string, PlatformAlert>();
  raise(key: string, severity: PlatformAlert['severity'], message: string) {
    const existing = this.alerts.get(key);
    const alert = {
      key,
      severity,
      message,
      firstSeenAt: existing?.firstSeenAt ?? new Date(),
      lastSeenAt: new Date(),
    };
    this.alerts.set(key, alert);
    if (!existing) this.logger.error(JSON.stringify({ event: 'platform.alert', ...alert }));
    return alert;
  }
  resolve(key: string) {
    const alert = this.alerts.get(key);
    if (alert && !alert.resolvedAt) {
      alert.resolvedAt = new Date();
      this.logger.log(
        JSON.stringify({ event: 'platform.alert_resolved', key, resolvedAt: alert.resolvedAt }),
      );
    }
  }
  list() {
    return [...this.alerts.values()];
  }
}
