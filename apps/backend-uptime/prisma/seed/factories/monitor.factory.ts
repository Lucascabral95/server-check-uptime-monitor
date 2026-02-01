import { faker } from '@faker-js/faker';
import { Monitor, Status } from '@prisma/client';

export class MonitorFactory {
  static create(
    userId: string,
    overrides?: Partial<Monitor>,
  ): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();

    return {
      userId,
      name: faker.company.name(),
      url: faker.internet.url({ protocol: 'https' }),
      frequency: faker.helpers.arrayElement([30, 60, 120, 300, 600]),
      isActive: true,
      nextCheck: new Date(now.getTime() + 60000),
      lastCheck: faker.datatype.boolean() ? faker.date.recent({ days: 1 }) : null,
      status: Status.PENDING,
      ...overrides,
    };
  }

  static createMany(
    userId: string,
    count: number,
    overrides?: Partial<Monitor>,
  ): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'>[] {
    return Array.from({ length: count }, () => this.create(userId, overrides));
  }

  static createActive(userId: string): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'> {
    return this.create(userId, {
      isActive: true,
      status: Status.UP,
      lastCheck: new Date(),
    });
  }

  static createInactive(userId: string): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'> {
    return this.create(userId, {
      isActive: false,
      status: Status.DOWN,
      lastCheck: faker.date.recent({ days: 7 }),
    });
  }

  static createDown(userId: string): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'> {
    return this.create(userId, {
      isActive: true,
      status: Status.DOWN,
      lastCheck: new Date(),
    });
  }
}