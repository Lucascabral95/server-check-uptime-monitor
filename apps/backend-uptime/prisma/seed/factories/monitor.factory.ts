import { Monitor, MonitorType, Status } from '@prisma/client';

export class MonitorFactory {
  private static readonly REAL_MONITORS = [
    {
      name: 'Google Search',
      url: 'https://www.google.com',
      frequency: 60,
      status: Status.UP,
    },
    {
      name: 'GitHub API',
      url: 'https://api.github.com',
      frequency: 300,
      status: Status.UP,
    },
    {
      name: 'JSONPlaceholder API',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      frequency: 600,
      status: Status.UP,
    },
    {
      name: 'HTTPBin Status',
      url: 'https://httpbin.org/status/200',
      frequency: 1800,
      status: Status.UP,
    },
    {
      name: 'Invalid Domain',
      url: 'https://this-domain-does-not-exist-12345.com',
      frequency: 3600,
      status: Status.DOWN,
    },
    {
      name: 'HTTPBin Error 500',
      url: 'https://httpbin.org/status/500',
      frequency: 7200,
      status: Status.DOWN,
    },
  ];

  static create(userId: string, index: number): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    const monitorConfig = this.REAL_MONITORS[index % this.REAL_MONITORS.length];

    return {
      userId,
      workspaceId: null,
      projectId: null,
      name: monitorConfig.name,
      url: monitorConfig.url,
      frequency: monitorConfig.frequency,
      isActive: true,
      nextCheck: new Date(now.getTime() + monitorConfig.frequency * 1000),
      lastCheck: new Date(now.getTime() - monitorConfig.frequency * 1000),
      status: monitorConfig.status,
      monitorType: MonitorType.HTTP,
      config: {},
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      heartbeatSecretHash: null,
      heartbeatIntervalSeconds: null,
      heartbeatGraceSeconds: null,
      heartbeatLastReceivedAt: null,
      maintenanceUntil: null,
    };
  }

  static createMany(
    userId: string,
    count: number,
  ): Omit<Monitor, 'id' | 'createdAt' | 'updatedAt'>[] {
    return Array.from({ length: count }, (_, index) => this.create(userId, index));
  }
}
