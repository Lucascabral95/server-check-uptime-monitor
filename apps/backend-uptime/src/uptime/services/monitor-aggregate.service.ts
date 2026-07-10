import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AggregateGranularity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { envs } from 'src/config/envs.schema';

@Injectable()
export class MonitorAggregateService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorAggregateService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(
      () => void this.rollup().catch(error => this.logger.error(error)),
      60 * 60 * 1000,
    );
    void this.rollup().catch(error => this.logger.error(error));
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async rollup(now = new Date()): Promise<void> {
    const hourEnd = new Date(now);
    hourEnd.setMinutes(0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(0, 0, 0, 0);
    await this.aggregateWindow(
      AggregateGranularity.HOURLY,
      new Date(hourEnd.getTime() - 3600000),
      hourEnd,
    );
    if (hourEnd.getTime() === dayEnd.getTime()) {
      await this.aggregateWindow(
        AggregateGranularity.DAILY,
        new Date(dayEnd.getTime() - 86400000),
        dayEnd,
      );
    }
    const retentionDays = envs.raw_log_retention_days;
    await this.prisma.pingLog.deleteMany({
      where: { timestamp: { lt: new Date(now.getTime() - retentionDays * 86400000) } },
    });
  }

  async get(monitorId: string, granularity: AggregateGranularity, since: Date) {
    return this.prisma.monitorAggregate.findMany({
      where: { monitorId, granularity, bucketStart: { gte: since } },
      orderBy: { bucketStart: 'asc' },
    });
  }

  private async aggregateWindow(granularity: AggregateGranularity, from: Date, to: Date) {
    const rows = await this.prisma.pingLog.groupBy({
      by: ['monitorId'],
      where: { timestamp: { gte: from, lt: to } },
      _count: { _all: true },
      _sum: { durationMs: true },
    });
    for (const row of rows) {
      const successes = await this.prisma.pingLog.count({
        where: { monitorId: row.monitorId, timestamp: { gte: from, lt: to }, success: true },
      });
      const failures = row._count._all - successes;
      const downtime = await this.prisma.$queryRaw<Array<{ value: bigint }>>(Prisma.sql`
        SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (LEAST(COALESCE(ended_at, ${to}), ${to}) - GREATEST(started_at, ${from}))) * 1000), 0)::bigint AS value
        FROM incidents WHERE monitor_id = ${row.monitorId} AND started_at < ${to} AND COALESCE(ended_at, ${to}) > ${from}
      `);
      const downtimeMs = downtime[0]?.value ?? BigInt(0);
      await this.prisma.monitorAggregate.upsert({
        where: {
          monitorId_granularity_bucketStart: {
            monitorId: row.monitorId,
            granularity,
            bucketStart: from,
          },
        },
        create: {
          monitorId: row.monitorId,
          granularity,
          bucketStart: from,
          checks: row._count._all,
          successes,
          failures,
          totalDurationMs: BigInt(row._sum.durationMs ?? 0),
          downtimeMs,
        },
        update: {
          checks: row._count._all,
          successes,
          failures,
          totalDurationMs: BigInt(row._sum.durationMs ?? 0),
          downtimeMs,
        },
      });
    }
  }
}
