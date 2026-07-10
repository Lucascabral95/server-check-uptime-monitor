import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SloService {
  constructor(private readonly prisma: PrismaService) {}
  async set(monitorId: string, target: number, periodDays = 30) {
    return this.prisma.sloTarget.upsert({
      where: { monitorId_periodDays: { monitorId, periodDays } },
      create: { monitorId, target, periodDays },
      update: { target },
    });
  }
  async get(monitorId: string) {
    const target = await this.prisma.sloTarget.findFirst({
      where: { monitorId },
      orderBy: { periodDays: 'asc' },
    });
    const since = new Date(Date.now() - (target?.periodDays ?? 30) * 86400000);
    const rows = await this.prisma.monitorAggregate.findMany({
      where: { monitorId, granularity: 'DAILY', bucketStart: { gte: since } },
    });
    const checks = rows.reduce((sum, row) => sum + row.checks, 0);
    const successes = rows.reduce((sum, row) => sum + row.successes, 0);
    const availability = checks ? (successes / checks) * 100 : 100;
    const targetValue = Number(target?.target ?? 99);
    const budget = Math.max(0, availability - targetValue);
    const downtimeMs = rows.reduce((sum, row) => sum + Number(row.downtimeMs), 0);
    const regionalRows = await this.prisma.probeResult.groupBy({
      by: ['region', 'success'],
      where: { monitorId, checkedAt: { gte: since } },
      _count: { _all: true },
    });
    const regionalAvailability = Array.from(new Set(regionalRows.map(row => row.region))).map(
      region => {
        const rowsForRegion = regionalRows.filter(row => row.region === region);
        const checksForRegion = rowsForRegion.reduce((sum, row) => sum + row._count._all, 0);
        const successesForRegion = rowsForRegion.find(row => row.success)?._count._all ?? 0;
        return {
          region,
          checks: checksForRegion,
          availability: checksForRegion
            ? Number(((successesForRegion / checksForRegion) * 100).toFixed(3))
            : 100,
        };
      },
    );
    return {
      monitorId,
      target: targetValue,
      periodDays: target?.periodDays ?? 30,
      availability: Number(availability.toFixed(3)),
      errorBudgetRemaining: Number(budget.toFixed(3)),
      checks,
      successes,
      monthlyCompliance: Number(availability.toFixed(3)),
      errorBudgetMinutes: Number(
        (
          (targetValue === 0 ? 0 : (100 - targetValue) / 100) *
          (target?.periodDays ?? 30) *
          1440
        ).toFixed(2),
      ),
      consumedMinutes: Number((downtimeMs / 60000).toFixed(2)),
      regionalAvailability,
    };
  }
}
