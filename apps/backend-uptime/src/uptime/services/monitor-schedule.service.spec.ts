import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MonitorScheduleService } from './monitor-schedule.service';

describe('MonitorScheduleService', () => {
  let service: MonitorScheduleService;

  const prismaMock = {
    monitor: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const queueMock = {
    add: jest.fn(),
    getJobs: jest.fn(),
    getRepeatableJobs: jest.fn(),
    removeRepeatableByKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorScheduleService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: getQueueToken(QUEUES_NAME.UPTIME_MONITOR), useValue: queueMock },
      ],
    }).compile();

    service = module.get(MonitorScheduleService);
    jest.clearAllMocks();
  });

  it('creates a repeatable job for an active monitor without a schedule', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      id: 'monitor-1',
      frequency: 60,
      isActive: true,
    });
    queueMock.getRepeatableJobs.mockResolvedValue([]);
    queueMock.add.mockResolvedValue({ id: 'job-1' });

    await expect(service.synchronizeMonitor('monitor-1')).resolves.toEqual({
      created: true,
      removed: 0,
    });
    expect(queueMock.add).toHaveBeenCalledWith(
      'check-monitor',
      { monitorId: 'monitor-1' },
      { jobId: 'monitor:monitor-1', repeat: { every: 60000 } },
    );
  });

  it('does not recreate an already-correct repeatable job', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      id: 'monitor-1',
      frequency: 60,
      isActive: true,
    });
    queueMock.getRepeatableJobs.mockResolvedValue([
      { id: 'monitor:monitor-1', key: 'repeat-1', every: '60000' },
    ]);

    await expect(service.synchronizeMonitor('monitor-1')).resolves.toEqual({
      created: false,
      removed: 0,
    });
    expect(queueMock.add).not.toHaveBeenCalled();
    expect(queueMock.removeRepeatableByKey).not.toHaveBeenCalled();
  });

  it('replaces a stale frequency using the repeatable job key', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue({
      id: 'monitor-1',
      frequency: 120,
      isActive: true,
    });
    queueMock.getRepeatableJobs.mockResolvedValue([
      { id: 'monitor:monitor-1', key: 'repeat-1', every: '60000' },
    ]);

    await service.synchronizeMonitor('monitor-1');

    expect(queueMock.removeRepeatableByKey).toHaveBeenCalledWith('repeat-1');
    expect(queueMock.add).toHaveBeenCalledWith(
      'check-monitor',
      { monitorId: 'monitor-1' },
      { jobId: 'monitor:monitor-1', repeat: { every: 120000 } },
    );
  });

  it('removes the repeatable job when the monitor was deleted', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue(null);
    queueMock.getRepeatableJobs.mockResolvedValue([
      { id: 'monitor:monitor-1', key: 'repeat-1', every: '60000' },
    ]);

    await expect(service.synchronizeMonitor('monitor-1')).resolves.toEqual({
      created: false,
      removed: 1,
    });
    expect(queueMock.removeRepeatableByKey).toHaveBeenCalledWith('repeat-1');
    expect(queueMock.add).not.toHaveBeenCalled();
  });

  it('removes orphaned repeatable jobs during a full synchronization', async () => {
    prismaMock.monitor.findMany.mockResolvedValue([{ id: 'monitor-1' }]);
    queueMock.getRepeatableJobs
      .mockResolvedValueOnce([
        { id: 'monitor:monitor-1', key: 'repeat-1', every: '60000' },
        { id: 'monitor:deleted-monitor', key: 'repeat-deleted', every: '60000' },
      ])
      .mockResolvedValueOnce([{ id: 'monitor:monitor-1', key: 'repeat-1', every: '60000' }]);
    prismaMock.monitor.findUnique.mockResolvedValue({
      id: 'monitor-1',
      frequency: 60,
      isActive: true,
    });

    await expect(service.synchronizeAll()).resolves.toEqual({
      orphanedRemoved: 1,
      jobsCreated: 0,
    });
    expect(queueMock.removeRepeatableByKey).toHaveBeenCalledWith('repeat-deleted');
  });
});
