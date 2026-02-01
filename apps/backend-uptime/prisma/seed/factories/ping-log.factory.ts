import { faker } from '@faker-js/faker';
import { PingLog } from '@prisma/client';

export class PingLogFactory {
  private static readonly MAX_COUNT = 100;

  static create(monitorId: string, overrides?: Partial<PingLog>): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'> {
    const success = faker.datatype.boolean(0.8); // 80% éxito
    
    return {
      monitorId,
      statusCode: success ? 200 : faker.helpers.arrayElement([404, 500, 502, 503]),
      durationMs: faker.number.int({ min: 50, max: 3000 }),
      error: success ? null : faker.lorem.sentence(),
      timestamp: faker.date.recent({ days: 30 }),
      success,
      ...overrides,
    };
  }

  static createMany(monitorId: string, count: number, overrides?: Partial<PingLog>): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'>[] {
    const limitedCount = Math.min(count, this.MAX_COUNT);
    return Array.from({ length: limitedCount }, () => this.create(monitorId, overrides));
  }

  static createSuccessful(monitorId: string): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'> {
    return this.create(monitorId, {
      success: true,
      statusCode: 200,
      error: null,
    });
  }

  static createFailed(monitorId: string): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'> {
    return this.create(monitorId, {
      success: false,
      statusCode: 500,
      error: 'Internal Server Error',
    });
  }

  static createTimeSeries(
    monitorId: string,
    daysBack: number = 7,
    logsPerDay: number = 24,
  ): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'>[] {
    const totalLogs = daysBack * logsPerDay;
    const limitedTotal = Math.min(totalLogs, this.MAX_COUNT);
    const logs: Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const now = new Date();

    for (let i = 0; i < limitedTotal; i++) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      logs.push(this.create(monitorId, { timestamp }));
    }

    return logs;
  }
}