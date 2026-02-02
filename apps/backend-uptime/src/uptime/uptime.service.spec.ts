import { Test, TestingModule } from '@nestjs/testing';
import { UptimeService } from './uptime.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SortBy, IncidentSortBy } from './dto';

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
  };

  const queueMock = {
    add: jest.fn(),
    remove: jest.fn(),
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
          provide: getQueueToken('uptime-monitor'),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<UptimeService>(UptimeService);
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
      queueMock.add = jest.fn().mockResolvedValue({ id: 'job-1' });

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
      expect(queueMock.add).toHaveBeenCalled();
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
      prismaMock.monitor.create = jest.fn().mockImplementation((data) => {
        return Promise.resolve({ ...mockMonitor, ...data.data });
      });
      queueMock.add = jest.fn().mockResolvedValue({ id: 'job-1' });

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

      const result = await service.findAll();

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
        where: expect.objectContaining({ isActive: true }),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by userId', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ userId: 'user-1', page: 1, limit: 10 });

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

      await service.findAll({ status: 'UP', page: 1, limit: 10 });

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

      await service.findAll({ search: 'test', page: 1, limit: 10 });

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

      await service.findAll({ includeInactive: true, page: 1, limit: 10 });

      const whereClause = (prismaMock.monitor.findMany as jest.Mock).mock.calls[0][0].where;
      expect(whereClause.isActive).toBeUndefined();
    });

    it('should sort by NAME_ASC', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([mockMonitor]);
      prismaMock.monitor.count = jest.fn().mockResolvedValue(1);

      await service.findAll({ sortBy: SortBy.NAME_ASC, page: 1, limit: 10 });

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

      const result = await service.findAll({ page: 2, limit: 10 });

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

      const result = await service.findAll({ sortBy: SortBy.STATUS_DOWN, page: 1, limit: 10 });

      expect(result.data[0].status).toBe('DOWN');
      expect(result.data[1].status).toBe('UP');
      expect(result.data[2].status).toBe('PENDING');
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

      await expect(service.findOne('monitor-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
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

    it('should update monitor job when frequency changes', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        frequency: 180,
      });
      queueMock.remove = jest.fn().mockResolvedValue(true);
      queueMock.add = jest.fn().mockResolvedValue({ id: 'new-job' });

      await service.update('monitor-1', { frequency: 180 }, 'user-1');

      expect(queueMock.remove).toHaveBeenCalledWith('monitor:monitor-1');
      expect(queueMock.add).toHaveBeenCalled();
    });

    it('should remove monitor job when isActive is set to false', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.update = jest.fn().mockResolvedValue({
        ...mockMonitor,
        isActive: false,
      });
      queueMock.remove = jest.fn().mockResolvedValue(true);

      await service.update('monitor-1', { isActive: false }, 'user-1');

      expect(queueMock.remove).toHaveBeenCalledWith('monitor:monitor-1');
      expect(queueMock.add).not.toHaveBeenCalled();
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
      queueMock.remove = jest.fn().mockResolvedValue(true);

      const result = await service.remove('monitor-1', 'user-1');

      expect(result).toBe('Monitor deleted successfully');
      expect(queueMock.remove).toHaveBeenCalledWith('monitor:monitor-1');
      expect(prismaMock.monitor.delete).toHaveBeenCalledWith({
        where: { id: 'monitor-1' },
      });
    });

    it('should remove monitor job before deleting monitor', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce(mockMonitor);
      prismaMock.monitor.delete = jest.fn().mockResolvedValue(mockMonitor);
      queueMock.remove = jest.fn().mockResolvedValue(true);

      await service.remove('monitor-1', 'user-1');

      expect(queueMock.remove).toHaveBeenCalled();
      expect(prismaMock.monitor.delete).toHaveBeenCalled();
      const removeCall = (prismaMock.monitor.delete as jest.Mock).mock.invocationCallOrder[0];
      const queueCall = (queueMock.remove as jest.Mock).mock.invocationCallOrder[0];
      expect(queueCall).toBeLessThan(removeCall);
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

      await expect(
        service['verifyOwnerMonitorByUserId']('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when user does not own the monitor', async () => {
      prismaMock.monitor.findUnique = jest.fn().mockResolvedValue({
        userId: 'different-user',
      });

      await expect(
        service['verifyOwnerMonitorByUserId']('monitor-1', 'user-1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service['verifyOwnerMonitorByUserId']('monitor-1', 'user-1'),
      ).rejects.toThrow('You are not authorized to access this monitor');
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
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([
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
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue([]);

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

      await expect(
        service.findStatsLogsByUptimeId('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getIncidents', () => {
    it('should return empty incidents when no logs exist', async () => {
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce({ status: 'UP' });
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result).toEqual({
        monitorId: 'monitor-1',
        incidents: [],
        totalIncidents: 0,
        totalDowntime: '0s',
        totalDowntimeMs: 0,
        ongoingIncidents: 0,
      });
    });

    it('should calculate incidents correctly', async () => {
      const logs = [
        { ...mockPingLog, success: true, timestamp: new Date('2024-01-01T10:00:00Z') },
        { ...mockPingLog, success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'Connection timeout' },
        { ...mockPingLog, success: false, timestamp: new Date('2024-01-01T11:01:00Z'), error: 'Connection timeout' },
        { ...mockPingLog, success: true, timestamp: new Date('2024-01-01T11:05:00Z') },
      ];
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce({ status: 'UP' });
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result.totalIncidents).toBe(1);
      expect(result.incidents[0].status).toBe('RESOLVED');
      expect(result.incidents[0].affectedChecks).toBe(2);
      expect(result.incidents[0].firstError).toBe('Connection timeout');
      expect(result.ongoingIncidents).toBe(0);
    });

    it('should mark incident as ONGOING when monitor is DOWN', async () => {
      const logs = [
        { ...mockPingLog, success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'Server error' },
      ];
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce({ status: 'DOWN' });
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result.incidents[0].status).toBe('ONGOING');
      expect(result.ongoingIncidents).toBe(1);
    });

    it('should sort incidents by start time descending', async () => {
      const logs = [
        { ...mockPingLog, success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'Error 1' },
        { ...mockPingLog, success: true, timestamp: new Date('2024-01-01T10:05:00Z') },
        { ...mockPingLog, success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'Error 2' },
        { ...mockPingLog, success: true, timestamp: new Date('2024-01-01T11:05:00Z') },
      ];
      prismaMock.monitor.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ userId: 'user-1' })
        .mockResolvedValueOnce({ status: 'UP' });
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidents('monitor-1', 'user-1');

      expect(result.incidents[0].startTime.getTime()).toBeGreaterThan(
        result.incidents[1].startTime.getTime(),
      );
    });
  });

  describe('getIncidentsByUserId', () => {
    it('should return empty result when user has no monitors', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([]);

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
      });
    });

    it('should return incidents grouped by monitor', async () => {
      const monitors = [
        { id: 'm1', name: 'Monitor 1', url: 'https://m1.com', status: 'UP' },
        { id: 'm2', name: 'Monitor 2', url: 'https://m2.com', status: 'DOWN' },
      ];
      const logs = [
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'Error' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T10:05:00Z') },
        { ...mockPingLog, monitorId: 'm2', success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'Down' },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result.totalMonitors).toBe(2);
      expect(result.monitorsDown).toBe(1);
      expect(result.byMonitor).toHaveLength(2);
      expect(result.byMonitor[0]).toHaveProperty('monitorId');
      expect(result.byMonitor[0]).toHaveProperty('incidentCount');
      expect(result.byMonitor[0]).toHaveProperty('hasOngoingIncident');
    });

    it('should filter monitors by search term', async () => {
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue([
        { id: 'm1', name: 'Production', url: 'https://prod.com', status: 'UP' },
        { id: 'm2', name: 'Staging', url: 'https://staging.com', status: 'UP' },
      ]);

      await service.getIncidentsByUserId('user-1', { search: 'prod' });

      expect(prismaMock.monitor.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'prod', mode: 'insensitive' } },
            { url: { contains: 'prod', mode: 'insensitive' } },
          ],
        }),
        select: expect.anything(),
      });
    });

    it('should sort incidents by RECENT by default', async () => {
      const monitors = [{ id: 'm1', name: 'M1', url: 'https://m1.com', status: 'UP' }];
      const logs = [
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'E1' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T10:05:00Z') },
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'E2' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T11:05:00Z') },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result.incidents[0].startTime.getTime()).toBeGreaterThan(
        result.incidents[1].startTime.getTime(),
      );
    });

    it('should sort incidents by DURATION_LONGEST', async () => {
      const monitors = [{ id: 'm1', name: 'M1', url: 'https://m1.com', status: 'UP' }];
      const logs = [
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'E1' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T10:02:00Z') },
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'E2' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T11:10:00Z') },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.pingLog.findMany = jest.fn().mockResolvedValue(logs);

      const result = await service.getIncidentsByUserId('user-1', {
        sortBy: IncidentSortBy.DURATION_LONGEST,
      });

      expect(result.incidents[0].durationMs).toBeGreaterThanOrEqual(
        result.incidents[1].durationMs,
      );
    });

    it('should sort byMonitor by incident count descending', async () => {
      const monitors = [
        { id: 'm1', name: 'M1', url: 'https://m1.com', status: 'UP' },
        { id: 'm2', name: 'M2', url: 'https://m2.com', status: 'UP' },
      ];
      const logsM1 = [
        { ...mockPingLog, monitorId: 'm1', success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'E' },
        { ...mockPingLog, monitorId: 'm1', success: true, timestamp: new Date('2024-01-01T10:05:00Z') },
      ];
      const logsM2 = [
        { ...mockPingLog, monitorId: 'm2', success: false, timestamp: new Date('2024-01-01T10:00:00Z'), error: 'E' },
        { ...mockPingLog, monitorId: 'm2', success: true, timestamp: new Date('2024-01-01T10:01:00Z') },
        { ...mockPingLog, monitorId: 'm2', success: false, timestamp: new Date('2024-01-01T11:00:00Z'), error: 'E' },
        { ...mockPingLog, monitorId: 'm2', success: true, timestamp: new Date('2024-01-01T11:05:00Z') },
      ];
      prismaMock.monitor.findMany = jest.fn().mockResolvedValue(monitors);
      prismaMock.pingLog.findMany = jest
        .fn()
        .mockResolvedValueOnce(logsM1)
        .mockResolvedValueOnce(logsM2);

      const result = await service.getIncidentsByUserId('user-1');

      expect(result.byMonitor[0].incidentCount).toBeGreaterThanOrEqual(
        result.byMonitor[1].incidentCount,
      );
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
