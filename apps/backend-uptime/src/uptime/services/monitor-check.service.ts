import { Injectable } from '@nestjs/common';
import { MonitorType } from '@prisma/client';
import { assertSafeMonitorUrl } from 'src/common/security/ssrf-guard';
import { CheckResult, HttpPoolService } from './http-pool.service';
import { HttpMonitorConfig, parseMonitorConfig } from '../monitor-config';
import { connect } from 'tls';

interface MonitorForCheck {
  monitorType: MonitorType;
  url: string;
  config: unknown;
  heartbeatLastReceivedAt: Date | null;
  heartbeatIntervalSeconds: number | null;
  heartbeatGraceSeconds: number | null;
}

@Injectable()
export class MonitorCheckService {
  constructor(private readonly httpPoolService: HttpPoolService) {}

  async execute(monitor: MonitorForCheck): Promise<CheckResult> {
    if (monitor.monitorType === MonitorType.HEARTBEAT) return this.checkHeartbeat(monitor);
    if (monitor.monitorType === MonitorType.SSL) return this.checkSsl(monitor);

    const http = parseMonitorConfig(monitor.config).http ?? {};
    return this.httpPoolService.checkUrl(
      monitor.url,
      http.timeoutMs ?? 10000,
      http as HttpMonitorConfig,
    );
  }

  private checkHeartbeat(monitor: MonitorForCheck): CheckResult {
    const started = Date.now();
    if (!monitor.heartbeatLastReceivedAt || !monitor.heartbeatIntervalSeconds) {
      return {
        success: false,
        statusCode: 0,
        durationMs: Date.now() - started,
        error: 'Heartbeat has not been configured',
      };
    }
    const grace = monitor.heartbeatGraceSeconds ?? Math.max(monitor.heartbeatIntervalSeconds, 60);
    const ageSeconds = (Date.now() - monitor.heartbeatLastReceivedAt.getTime()) / 1000;
    return {
      success: ageSeconds <= monitor.heartbeatIntervalSeconds + grace,
      statusCode: ageSeconds <= monitor.heartbeatIntervalSeconds + grace ? 200 : 504,
      durationMs: Date.now() - started,
      error:
        ageSeconds <= monitor.heartbeatIntervalSeconds + grace ? undefined : 'Heartbeat overdue',
    };
  }

  private async checkSsl(monitor: MonitorForCheck): Promise<CheckResult> {
    const started = Date.now();
    await assertSafeMonitorUrl(monitor.url);
    const url = new URL(monitor.url);
    if (url.protocol !== 'https:') {
      return {
        success: false,
        statusCode: 0,
        durationMs: Date.now() - started,
        error: 'SSL monitors require HTTPS',
      };
    }
    const alertBeforeDays = parseMonitorConfig(monitor.config).ssl?.alertBeforeDays ?? 30;
    return new Promise(resolve => {
      const socket = connect({
        host: url.hostname,
        port: Number(url.port) || 443,
        servername: url.hostname,
        rejectUnauthorized: true,
      });
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({
          success: false,
          statusCode: 0,
          durationMs: Date.now() - started,
          error: 'TLS handshake timeout',
        });
      }, 10000);
      socket.once('secureConnect', () => {
        clearTimeout(timeout);
        const certificate = socket.getPeerCertificate();
        socket.end();
        const expiresAt = certificate.valid_to ? Date.parse(certificate.valid_to) : NaN;
        const daysRemaining = (expiresAt - Date.now()) / 86_400_000;
        const success = Number.isFinite(expiresAt) && daysRemaining >= 0;
        resolve({
          success,
          statusCode: success ? 200 : 495,
          durationMs: Date.now() - started,
          error:
            success && daysRemaining <= alertBeforeDays
              ? `Certificate expires in ${Math.ceil(daysRemaining)} days`
              : !success
                ? 'Certificate is invalid or expired'
                : undefined,
        });
      });
      socket.once('error', error => {
        clearTimeout(timeout);
        resolve({
          success: false,
          statusCode: 495,
          durationMs: Date.now() - started,
          error: error.message,
        });
      });
    });
  }
}
