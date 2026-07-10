import { Test, TestingModule } from '@nestjs/testing';
import { UptimeService } from './uptime.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SortBy, IncidentSortBy } from './dto';
import { MonitorScheduleOutboxService } from './services/monitor-schedule-outbox.service';
import { MonitorScheduleService } from './services/monitor-schedule.service';

describe('UptimeService', () => {
  let service: UptimeService;

  const mockMonitor = {
    id: 'monitor-1',
    userId: 'user-1',
    name: 'Test Monitor',
    url: 'https://example.com',
    frequency: 60,
    status: 'UP',
    isActive: true,
    nextCheck: new Date(),
    lastCheck: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequestingUser = { dbUserId: 'user-1', role: 'USER' };
  const mockAdminUser = { dbUserId: 'admin-1', role: 'ADMIN' };

  const mockPingLog = {
    id: 'log-1',
    monitorId: 'monitor-1',
    timestamp: new Date(),
    success: true,
    statusCode: 200,
    responseTime: 150,
  };

  const prismaMock = {
    monitor: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    pingLog: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    incident: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };

  const monitorScheduleOutboxServiceMock = {
    enqueue: jest.fn(),
  };

  const monitorScheduleServiceMock = {
    clearAll: jest.fn(),
    synchronizeAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UptimeService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MonitorScheduleOutboxService,
          useValue: monitorScheduleOutboxServiceMock,
        },
        {
          provide: MonitorScheduleService,
          useValue: monitorScheduleServiceMock,
        },
      ],
    }).compile();

    service = module.get<UptimeService>(UptimeService);
    prismaMock.$transaction.mockImplementation(async callback =>
      callback({ monitor: prismaMock.monitor, incident: prismaMock.incident }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Monitor',
      url: 'https://test.com',
      frequency: 120,
    };

    it('should create a monitor successfully', async () => {
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-1' });
      prismaMock.monitor.create = jest.fn().mockResolvedValue(mockMonitor);
      monitorScheduleOutboxServiceMock.enqueue.mockResolvedValue(undefined);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockMonitor);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true },
      });
      expect(prismaMock.monitor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          name: createDto.name,
          url: createDto.url,
          frequency: createDto.frequency,
          isActive: true,
        }),
      });
      expect(monitorScheduleOutboxServiceMock.enqueue).toHaveBeenCalledWith(
        expect.anything(),
        mockMonitor.id,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaMock.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(createDto, 'non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto, 'non-existent-user')).rejects.toThrow(
        "User with id 'non-existent-user' does not exist",
      );
    });

    it('should calculate nextCheck based on frequency', async () => {
      prismaMock.user.findUnique = jest.fn().mockResolvedValue({ id: 'user-1' });
      prismaMock.monitor.create = jest.fn().mockImplementation(data => {
        return Promise.resolve({ ...mockMonitor, ...data.data });
      });
      monitorScheduleOutboxServiceMock.enqueue.mockResolvedValue(undefined);

      await service.create(createDto, 'user-1');

      const createCall = prismaMock.monitor.create as jest.Mock;
      const nextCheck = createCall.mock.calls[0][0].data.nextCheck;

      expect(nextCheck).toBeInstanceOf(Date);
      const timeDiff = nextCheck.getTime() - Date.now();
      // Allow small tolerance for execution time
      expect(timeDiff).toBeGreaterThan(118000); // ~120 seconds in ms with tolerance
      expect(timeDiff).toBeLessThan(124000); // Allow some tolerance
    });
  });

  describe('findAll', () => {
    it('should return paginated monitors with default params', async () => {
      const monitors = [mockMonitor, { ...mockMonitor, id: 'monitor-2' }];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(2);

      const result = await service.findAll({}, mockRequestingUser);

      expect(result.data).toEqual(monitors);
      expect(result.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        totalItems: 2,
        itemsPerPage: 10,
      });
      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ isActive: true, userId: mockRequestingUser.dbUserId }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('non-admin cannot override userId via query — always scoped to their own dbUserId', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ userId: 'someone-elses-id', page: 1, limit: 10 }, mockRequestingUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ userId: mockRequestingUser.dbUserId, isActive: true }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('ADMIN can filter by an arbitrary userId', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ userId: 'user-1', page: 1, limit: 10 }, mockAdminUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ userId: 'user-1', isActive: true }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ status: 'UP', page: 1, limit: 10 }, mockRequestingUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ status: 'UP', isActive: true }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should search by name and url', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ search: 'test', page: 1, limit: 10 }, mockRequestingUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { url: { contains: 'test', mode: 'insensitive' } },
          ],
          isActive: true,
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should include inactive monitors when requested', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ includeInactive: true, page: 1, limit: 10 }, mockRequestingUser);

      const whereClause = (prismaMock.monitor.findMany as jest.Mock).mock.calls[0][0].where;
      expect(whereClause.isActive).toBeUndefined();
    });

    it('should sort by NAME_ASC', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ sortBy: SortBy.NAME_ASC, page: 1, limit: 10 }, mockRequestingUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.anything(),
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
    });

    it('should calculate pagination correctly', async () => {
      const monitors = Array.from({ length: 10 }, (_, i) => ({
        ...mockMonitor,
        id: `monitor-${i}`,
      }));
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 10 }, mockRequestingUser);

      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        nextPage: 3,
        prevPage: 1,
        totalItems: 25,
        itemsPerPage: 10,
      });
    });

    it('should sort by STATUS_DOWN with DOWN monitors first', async () => {
      const monitors = [
        { ...mockMonitor, status: 'UP' },
        { ...mockMonitor, id: 'monitor-2', status: 'DOWN' },
        { ...mockMonitor, id: 'monitor-3', status: 'PENDING' },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(3);

      const result = await service.findAll(
        { sortBy: SortBy.STATUS_DOWN, page: 1, limit: 10 },
        mockRequestingUser,
      );

      expect(result.data[0].status).toBe('DOWN');
      expect(result.data[1].status).toBe('UP');
      expect(result.data[2].status).toBe('PENDING');
    });

    it('should sort by STATUS_UP with UP monitors first', async () => {
      const monitors = [
        { ...mockMonitor, status: 'DOWN' },
        { ...mockMonitor, id: 'monitor-2', status: 'UP' },
        { ...mockMonitor, id: 'monitor-3', status: 'PENDING' },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(3);

      const result = await service.findAll(
        { sortBy: SortBy.STATUS_UP, page: 1, limit: 10 },
        mockRequestingUser,
      );

      expect(result.data[0].status).toBe('UP');
      expect(result.data[1].status).toBe('DOWN');
      expect(result.data[2].status).toBe('PENDING');
    });

    it('ADMIN can filter by email', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ email: 'user@example.com', page: 1, limit: 10 }, mockAdminUser);

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          user: { email: 'user@example.com' },
          isActive: true,
        }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a monitor by id', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue(mockMonitor);

      const result = await service.findOne('monitor-1', 'user-1');

      expect(result).toEqual(mockMonitor);
      expect(prismaMock.monitor.findUnique).toHaveBeenCalledWith({
        where: { id: 'monitor-1' },
      });
    });

    it('should call verifyOwnerMonitorByUserId', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);

      await service.findOne('monitor-1', 'user-1');

      expect(prismaMock.monitor.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when monitor not found', async () => {
      // verifyOwnerMonitorByUserId returns null (monitor doesn't exist)
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('monitor-1', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('monitor-1', 'user-1')).rejects.toThrow(
        "Monitor with id 'monitor-1' not found",
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Monitor',
      frequency: 180,
    };

    it('should update a monitor successfully', async () => {
      // First call: verifyOwnerMonitorByUserId (selects only userId)
      // Second call: findOne (returns full monitor)
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        ...updateDto,
      });

      const result = await service.update('monitor-1', updateDto, 'user-1');

      expect(result).toEqual({
        message: 'Monitor monitor-1 updated successfully',
        monitor: expect.objectContaining(updateDto),
      });
      expect(prismaMock.monitor.update).toHaveBeenCalledWith({
        where: { id: 'monitor-1', userId: 'user-1' },
        data: updateDto,
      });
    });

    it('enqueues a schedule synchronization when frequency changes', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        frequency: 180,
      });
      await service.update('monitor-1', { frequency: 180 }, 'user-1');

      expect(monitorScheduleOutboxServiceMock.enqueue).toHaveBeenCalledWith(
        expect.anything(),
        'monitor-1',
      );
    });

    it('enqueues a schedule synchronization when isActive is set to false', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        isActive: false,
      });
      await service.update('monitor-1', { isActive: false }, 'user-1');

      expect(monitorScheduleOutboxServiceMock.enqueue).toHaveBeenCalledWith(
        expect.anything(),
        'monitor-1',
      );
    });

    it('resolves any ONGOING incident when the monitor is deactivated (processor will never run DOWN->UP again)', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        isActive: false,
      });
      await service.update('monitor-1', { isActive: false }, 'user-1');

      expect(prismaMock.incident.updateMany).toHaveBeenCalledWith({
        where: { monitorId: 'monitor-1', status: 'ONGOING' },
        data: { status: 'RESOLVED', endedAt: expect.any(Date) },
      });
    });

    it('does not touch incidents when isActive is not part of the update', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue(mockMonitor);

      await service.update('monitor-1', { name: 'New name' }, 'user-1');

      expect(prismaMock.incident.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a monitor successfully', async () => {
      // First call: verifyOwnerMonitorByUserId (selects only userId)
      // Second call: findOne (returns full monitor)
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.delete = jest.fn().mockResolvedValue(mockMonitor);
      const result = await service.remove('monitor-1', 'user-1');

      expect(result).toBe('Monitor deleted successfully');
      expect(monitorScheduleOutboxServiceMock.enqueue).toHaveBeenCalledWith(
        expect.anything(),
        'monitor-1',
      );
      expect(prismaMock.monitor.delete).toHaveBeenCalledWith({
        where: { id: 'monitor-1' },
      });
    });

    it('persists the deletion event before deleting the monitor', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.delete = jest.fn().mockResolvedValue(mockMonitor);
      await service.remove('monitor-1', 'user-1');

      expect(monitorScheduleOutboxServiceMock.enqueue).toHaveBeenCalled();
      expect(prismaMock.monitor.delete).toHaveBeenCalled();
      const removeCall = (prismaMock.monitor.delete as jest.Mock).mock.invocationCallOrder[0];
      const outboxCall = (monitorScheduleOutboxServiceMock.enqueue as jest.Mock).mock
        .invocationCallOrder[0];
      expect(outboxCall).toBeLessThan(removeCall);
    });
  });

  describe('clearAllQueueJobs', () => {
    it('delegates queue cleanup to the schedule service', async () => {
      const expectedResult = { message: 'Queue cleared successfully', removedCount: 3 };
      monitorScheduleServiceMock.clearAll.mockResolvedValue(expectedResult);

      const result = await service.clearAllQueueJobs();

      expect(monitorScheduleServiceMock.clearAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('syncQueueJobs', () => {
    it('delegates queue synchronization to the schedule service', async () => {
      const expectedResult = { orphanedRemoved: 1, jobsCreated: 1 };
      monitorScheduleServiceMock.synchronizeAll.mockResolvedValue(expectedResult);

      const result = await service.syncQueueJobs();

      expect(monitorScheduleServiceMock.synchronizeAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyOwnerMonitorByUserId', () => {
    it('should pass when user owns the monitor', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue({
        userId: 'user-1',
      });

      await expect(
        service['verifyOwnerMonitorByUserId']('monitor-1', 'user-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException when monitor does not exist', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service['verifyOwnerMonitorByUserId']('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException when user does not own the monitor', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue({
        userId: 'different-user',
      });

      await expect(service['verifyOwnerMonitorByUserId']('monitor-1', 'user-1')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service['verifyOwnerMonitorByUserId']('monitor-1', 'user-1')).rejects.toThrow(
        'You are not authorized to access this monitor',
      );
    });
  });

  describe('getStatsByUserId', () => {
    it('should return user statistics', async () => {
      prismaMock.monitor.count = jest
        .fn()
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7) // up
        .mockResolvedValueOnce(2) // down
        .mockResolvedValueOnce(1); // pending
      prismaMock.monitor.findMany = jest
        .fn()
        .mockResolvedValue([
          { id: 'm1', name: 'Down Monitor', url: 'https://down.com', lastCheck: new Date() },
        ]);

      const result = await service.getStatsByUserId('user-1');

      expect(result).toEqual({
        totalMonitors: 10,
        up: 7,
        down: 2,
        pending: 1,
        downLast24hCount: 1,
        downLast24h: [
          { id: 'm1', name: 'Down Monitor', url: 'https://down.com', lastCheck: expect.any(Date) },
        ],
        hasDowntimeLast24h: true,
      });
    });

    it('should return hasDowntimeLast24h as false when no down monitors', async () => {
      prismaMock.monitor.count = jest
        .fn()
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getStatsByUserId('user-1');

      expect(result.hasDowntimeLast24h).toBe(false);
      expect(result.downLast24hCount).toBe(0);
    });
  });

  describe('findStatsLogsByUptimeId', () => {
    it('should return monitor stats with logs', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce({
          ...mockMonitor,
          logs: [],
        });
      prismaMock.pingLog.groupBy = jest.fn().mockResolvedValue([
        { success: true, _count: 95 },
        { success: false, _count: 5 },
      ]);
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ downtime_ms: BigInt(0) }]);

      const result = await service.findStatsLogsByUptimeId('monitor-1', 'user-1');

      expect(result).toHaveProperty('monitor');
      expect(result).toHaveProperty('stats');
      expect(result.stats).toHaveProperty('last24Hours');
      expect(result.stats).toHaveProperty('last7Days');
      expect(result.stats).toHaveProperty('last30Days');
      expect(result.stats).toHaveProperty('last365Days');
    });

    it('should throw NotFoundException when monitor not found', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(null);

      await expect(service.findStatsLogsByUptimeId('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getIncidents', () => {
    it('should return empty incidents when there are none', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValueOnce({ userId: 'user-1' });
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);
      prismaMock.incident.count = jest.fn().mockResolvedValue(0);
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ downtime_ms: BigInt(0) }]);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result).toEqual({
        monitorId: 'monitor-1',
        incidents: [],
        totalIncidents: 0,
        totalDowntime: '0s',
        totalDowntimeMs: 0,
        ongoingIncidents: 0,
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 20 },
      });
    });

    it('should map Incident rows into the response DTO', async () => {
      const incidentRow = {
        id: 'incident-1',
        monitorId: 'monitor-1',
        status: 'RESOLVED',
        startedAt: new Date('2024-01-01T11:00:00Z'),
        endedAt: new Date('2024-01-01T11:05:00Z'),
        firstError: 'Connection timeout',
        lastError: 'Connection timeout',
        affectedChecks: 2,
      };
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValueOnce({ userId: 'user-1' });
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([incidentRow]);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ downtime_ms: BigInt(300000) }]);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result.totalIncidents).toBe(1);
      expect(result.incidents[0].status).toBe('RESOLVED');
      expect(result.incidents[0].affectedChecks).toBe(2);
      expect(result.incidents[0].firstError).toBe('Connection timeout');
      expect(result.ongoingIncidents).toBe(0);
      expect(result.totalDowntimeMs).toBe(300000);
    });

    it('should reflect ONGOING status directly from the Incident row (endedAt null)', async () => {
      const incidentRow = {
        id: 'incident-1',
        monitorId: 'monitor-1',
        status: 'ONGOING',
        startedAt: new Date('2024-01-01T11:00:00Z'),
        endedAt: null,
        firstError: 'Server error',
        lastError: 'Server error',
        affectedChecks: 1,
      };
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValueOnce({ userId: 'user-1' });
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([incidentRow]);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(1);
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ downtime_ms: BigInt(0) }]);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result.incidents[0].status).toBe('ONGOING');
      expect(result.incidents[0].endTime).toBeNull();
      expect(result.ongoingIncidents).toBe(1);
    });

    it('should query incidents ordered by startedAt desc and paginate', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValueOnce({ userId: 'user-1' });
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);
      prismaMock.incident.count = jest.fn().mockResolvedValue(45);
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ downtime_ms: BigInt(0) }]);

      const result = await service.getIncidents('monitor-1', 'user-1', {
        page: 2,
        limit: 10,
      } as any);

      expect(prismaMock.incident.findMany).toHaveBeenCalledWith({
        where: { monitorId: 'monitor-1' },
        orderBy: { startedAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 45,
        itemsPerPage: 10,
      });
    });
  });

  describe('getIncidentsByUserId', () => {
    it('should return empty result when user has no monitors/incidents', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce([]); // getMonitorIncidentSummaries
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        incidents: [],
        byMonitor: [],
        totalIncidents: 0,
        totalDowntime: '0s',
        totalDowntimeMs: 0,
        ongoingIncidents: 0,
        totalMonitors: 0,
        monitorsDown: 0,
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 20 },
      });
    });

    it('should return incidents grouped by monitor (from the GROUP BY summary query)', async () => {
      const byMonitorRows = [
        {
          monitorId: 'm1',
          monitorName: 'Monitor 1',
          monitorUrl: 'https://m1.com',
          monitorStatus: 'UP',
          incidentCount: 1,
          hasOngoingIncident: false,
          totalDowntimeMs: 60000,
        },
        {
          monitorId: 'm2',
          monitorName: 'Monitor 2',
          monitorUrl: 'https://m2.com',
          monitorStatus: 'DOWN',
          incidentCount: 1,
          hasOngoingIncident: true,
          totalDowntimeMs: 30000,
        },
      ];
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce(byMonitorRows);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result.totalMonitors).toBe(2);
      expect(result.monitorsDown).toBe(1);
      expect(result.byMonitor).toHaveLength(2);
      expect(result.byMonitor[0]).toHaveProperty('monitorId');
      expect(result.byMonitor[0]).toHaveProperty('incidentCount');
      expect(result.byMonitor[0]).toHaveProperty('hasOngoingIncident');
      expect(result.ongoingIncidents).toBe(1);
      expect(result.totalDowntimeMs).toBe(90000);
    });

    it('should filter by search term on both the summary and the count query', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce([]);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      await service.getIncidentsByUserId('user-1', { search: 'prod' } as any);

      expect(prismaMock.incident.count).toHaveBeenNthCalledWith(1, {
        where: {
          userId: 'user-1',
          monitor: {
            OR: [
              { name: { contains: 'prod', mode: 'insensitive' } },
              { url: { contains: 'prod', mode: 'insensitive' } },
            ],
          },
        },
      });
    });

    it('should sort incidents by RECENT by default via Prisma orderBy', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce([]);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      await service.getIncidentsByUserId('user-1');

      expect(prismaMock.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { startedAt: 'desc' } }),
      );
    });

    it('should sort incidents by DURATION_LONGEST via a raw query with LIMIT/OFFSET (not a full findMany)', async () => {
      const durationRows = [
        {
          id: 'i1',
          monitorId: 'm1',
          status: 'RESOLVED',
          startedAt: new Date('2024-01-01T10:00:00Z'),
          endedAt: new Date('2024-01-01T10:02:00Z'),
          affectedChecks: 1,
          firstError: null,
          lastError: null,
          monitorName: 'M1',
          monitorUrl: 'https://m1.com',
          monitorStatus: 'UP',
          durationMs: BigInt(120000),
        },
        {
          id: 'i2',
          monitorId: 'm1',
          status: 'RESOLVED',
          startedAt: new Date('2024-01-01T11:00:00Z'),
          endedAt: new Date('2024-01-01T11:10:00Z'),
          affectedChecks: 1,
          firstError: null,
          lastError: null,
          monitorName: 'M1',
          monitorUrl: 'https://m1.com',
          monitorStatus: 'UP',
          durationMs: BigInt(600000),
        },
      ];
      prismaMock.$queryRaw = jest
        .fn()
        .mockResolvedValueOnce([]) // getMonitorIncidentSummaries
        .mockResolvedValueOnce(durationRows); // findIncidentsPageByUserIdSortedByDuration
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn();

      const result = await service.getIncidentsByUserId('user-1', {
        sortBy: IncidentSortBy.DURATION_LONGEST,
      } as any);

      expect(result.incidents).toHaveLength(2);
      expect(result.incidents[0].durationMs).toBe(120000);
      expect(result.incidents[1].durationMs).toBe(600000);
      expect(prismaMock.incident.findMany).not.toHaveBeenCalled();
    });

    it('should sort byMonitor by incident count descending', async () => {
      const byMonitorRows = [
        {
          monitorId: 'm1',
          monitorName: 'M1',
          monitorUrl: 'https://m1.com',
          monitorStatus: 'UP',
          incidentCount: 1,
          hasOngoingIncident: false,
          totalDowntimeMs: 0,
        },
        {
          monitorId: 'm2',
          monitorName: 'M2',
          monitorUrl: 'https://m2.com',
          monitorStatus: 'UP',
          incidentCount: 2,
          hasOngoingIncident: false,
          totalDowntimeMs: 0,
        },
      ];
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce(byMonitorRows);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result.byMonitor[0].incidentCount).toBeGreaterThanOrEqual(
        result.byMonitor[1].incidentCount,
      );
    });

    it('paginates the incidents list', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValueOnce([]);
      prismaMock.incident.count = jest.fn().mockResolvedValueOnce(45).mockResolvedValueOnce(0);
      prismaMock.incident.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getIncidentsByUserId('user-1', { page: 2, limit: 10 } as any);

      expect(prismaMock.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 45,
        itemsPerPage: 10,
      });
    });
  });

  describe('formatDuration (private)', () => {
    it('should format seconds correctly', () => {
      expect(service['formatDuration'](1000)).toBe('1s');
      expect(service['formatDuration'](59000)).toBe('59s');
    });

    it('should format minutes and seconds correctly', () => {
      expect(service['formatDuration'](60000)).toBe('1m');
      expect(service['formatDuration'](125000)).toBe('2m 5s');
    });

    it('should format hours, minutes, and seconds correctly', () => {
      expect(service['formatDuration'](3600000)).toBe('1h');
      expect(service['formatDuration'](3665000)).toBe('1h 1m 5s');
    });

    it('should format days, hours, minutes, and seconds correctly', () => {
      expect(service['formatDuration'](86400000)).toBe('1d');
      expect(service['formatDuration'](90061000)).toBe('1d 1h 1m 1s');
    });

    it('should return 0s for zero duration', () => {
      expect(service['formatDuration'](0)).toBe('0s');
    });
  });
});
