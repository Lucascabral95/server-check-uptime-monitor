import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MonitorScheduleOutboxService } from './monitor-schedule-outbox.service';
import { MonitorScheduleService } from './monitor-schedule.service';

describe('MonitorScheduleOutboxService', () => {
  let service: MonitorScheduleOutboxService;

  const prismaMock = {
    monitorScheduleOutbox: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const monitorScheduleServiceMock = {
    synchronizeMonitor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorScheduleOutboxService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MonitorScheduleService, useValue: monitorScheduleServiceMock },
      ],
    }).compile();

    service = module.get(MonitorScheduleOutboxService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('persists a synchronization event with the caller transaction', async () => {
    const transaction = {
      monitorScheduleOutbox: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    await service.enqueue(transaction as never, 'monitor-1');

    expect(transaction.monitorScheduleOutbox.create).toHaveBeenCalledWith({
      data: { monitorId: 'monitor-1' },
    });
  });

  it('claims, synchronizes and marks an available event as processed', async () => {
    prismaMock.monitorScheduleOutbox.findMany.mockResolvedValue([
      { id: 'event-1', monitorId: 'monitor-1', attempts: 0 },
    ]);
    prismaMock.monitorScheduleOutbox.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });

    await service.processAvailableEvents();

    expect(monitorScheduleServiceMock.synchronizeMonitor).toHaveBeenCalledWith('monitor-1');
    expect(prismaMock.monitorScheduleOutbox.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          processedAt: expect.any(Date),
          lockedBy: null,
        }),
      }),
    );
  });

  it('releases an event with exponential backoff when synchronization fails', async () => {
    prismaMock.monitorScheduleOutbox.findMany.mockResolvedValue([
      { id: 'event-1', monitorId: 'monitor-1', attempts: 1 },
    ]);
    prismaMock.monitorScheduleOutbox.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    monitorScheduleServiceMock.synchronizeMonitor.mockRejectedValue(new Error('Redis unavailable'));

    await service.processAvailableEvents();

    expect(prismaMock.monitorScheduleOutbox.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          availableAt: expect.any(Date),
          lastError: 'Redis unavailable',
          lockedBy: null,
        }),
      }),
    );
  });

  it('does not synchronize an event claimed by another relay', async () => {
    prismaMock.monitorScheduleOutbox.findMany.mockResolvedValue([
      { id: 'event-1', monitorId: 'monitor-1', attempts: 0 },
    ]);
    prismaMock.monitorScheduleOutbox.updateMany.mockResolvedValue({ count: 0 });

    await service.processAvailableEvents();

    expect(monitorScheduleServiceMock.synchronizeMonitor).not.toHaveBeenCalled();
  });
});
