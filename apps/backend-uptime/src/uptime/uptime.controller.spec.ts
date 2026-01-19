import { Test, TestingModule } from '@nestjs/testing';
import { UptimeController } from './uptime.controller';
import { UptimeService } from './uptime.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { PaginationUptimeDto } from './dto/pagination-uptime.dto';
import { Status } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UptimeController', () => {
  let controller: UptimeController;
  let service: UptimeService;

  const mockPrismaService = {
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
  };

  const mockQueue = {
    add: jest.fn(),
    remove: jest.fn(),
  };

  const mockHttpPoolService = {
    getStats: jest.fn(),
    getPoolInfo: jest.fn(),
  };

  const mockPingLogBufferService = {
    getStats: jest.fn(),
    getBufferUtilization: jest.fn(),
    forceFlush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UptimeController],
      providers: [
        UptimeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('uptime-monitor'),
          useValue: mockQueue,
        },
        {
          provide: HttpPoolService,
          useValue: mockHttpPoolService,
        },
        {
          provide: PingLogBufferService,
          useValue: mockPingLogBufferService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UptimeController>(UptimeController);
    service = module.get<UptimeService>(UptimeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated monitors with default values', async () => {
      const monitors = [
        { id: '1', name: 'Monitor 1', url: 'https://example.com' },
        { id: '2', name: 'Monitor 2', url: 'https://test.com' },
      ];

      mockPrismaService.monitor.findMany.mockResolvedValue(monitors);
      mockPrismaService.monitor.count.mockResolvedValue(2);

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: monitors,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          totalItems: 2,
          itemsPerPage: 10,
        },
      });
      expect(mockPrismaService.monitor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return paginated monitors with custom page and limit', async () => {
      const monitors = [
        { id: '1', name: 'Monitor 1', url: 'https://example.com' },
      ];

      mockPrismaService.monitor.findMany.mockResolvedValue(monitors);
      mockPrismaService.monitor.count.mockResolvedValue(15);

      const paginationDto: PaginationUptimeDto = {
        page: 2,
        limit: 5,
      };

      const result = await controller.findAll(paginationDto);

      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        nextPage: 3,
        prevPage: 1,
        totalItems: 15,
        itemsPerPage: 5,
      });
      expect(mockPrismaService.monitor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by userId when provided', async () => {
      const monitors = [
        { id: '1', name: 'Monitor 1', userId: 'user-123' },
      ];

      mockPrismaService.monitor.findMany.mockResolvedValue(monitors);
      mockPrismaService.monitor.count.mockResolvedValue(1);

      const paginationDto: PaginationUptimeDto = {
        page: 1,
        limit: 10,
        userId: 'user-123',
      };

      const result = await controller.findAll(paginationDto);

      expect(result.data).toEqual(monitors);
      expect(mockPrismaService.monitor.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.monitor.count).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should filter by status when provided', async () => {
      const monitors = [
        { id: '1', name: 'Monitor 1', status: Status.UP },
      ];

      mockPrismaService.monitor.findMany.mockResolvedValue(monitors);
      mockPrismaService.monitor.count.mockResolvedValue(1);

      const paginationDto: PaginationUptimeDto = {
        page: 1,
        limit: 10,
        status: Status.UP,
      };

      const result = await controller.findAll(paginationDto);

      expect(result.data).toEqual(monitors);
      expect(mockPrismaService.monitor.findMany).toHaveBeenCalledWith({
        where: { status: Status.UP },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by both userId and status when provided', async () => {
      const monitors = [
        { id: '1', name: 'Monitor 1', userId: 'user-123', status: Status.UP },
      ];

      mockPrismaService.monitor.findMany.mockResolvedValue(monitors);
      mockPrismaService.monitor.count.mockResolvedValue(1);

      const paginationDto: PaginationUptimeDto = {
        page: 1,
        limit: 10,
        userId: 'user-123',
        status: Status.UP,
      };

      const result = await controller.findAll(paginationDto);

      expect(result.data).toEqual(monitors);
      expect(mockPrismaService.monitor.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', status: Status.UP },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no monitors found', async () => {
      mockPrismaService.monitor.findMany.mockResolvedValue([]);
      mockPrismaService.monitor.count.mockResolvedValue(0);

      const result = await controller.findAll({});

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a new monitor', async () => {
      const createDto = {
        name: 'Test Monitor',
        url: 'https://example.com',
        frequency: 60,
        userId: 'user-123',
      };

      const createdMonitor = {
        id: 'monitor-1',
        ...createDto,
        isActive: true,
        nextCheck: new Date(),
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-123' });
      mockPrismaService.monitor.create.mockResolvedValue(createdMonitor);
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      const result = await controller.create(createDto);

      expect(result).toEqual(createdMonitor);
      expect(mockPrismaService.monitor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          url: createDto.url,
          frequency: createDto.frequency,
          userId: createDto.userId,
          isActive: true,
        }),
      });
    });
  });

  describe('findOne', () => {
    it('should return a single monitor by id', async () => {
      const monitorForVerification = {
        id: 'monitor-1',
        userId: 'user-123',
      };

      const fullMonitor = {
        id: 'monitor-1',
        name: 'Test Monitor',
        url: 'https://example.com',
        userId: 'user-123',
      };

      mockPrismaService.monitor.findUnique
        .mockResolvedValueOnce(monitorForVerification)
        .mockResolvedValueOnce(fullMonitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const result = await controller.findOne('monitor-1', mockRequest);

      expect(result).toEqual(fullMonitor);
      expect(mockPrismaService.monitor.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when monitor not found', async () => {
      mockPrismaService.monitor.findUnique.mockResolvedValue(null);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(controller.findOne('non-existent', mockRequest)).rejects.toThrow(
        NotFoundException
      );
      await expect(controller.findOne('non-existent', mockRequest)).rejects.toThrow(
        'Monitor with id \'non-existent\' not found'
      );
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      const differentUsersMonitor = {
        id: 'monitor-1',
        userId: 'other-user-456',
      };

      mockPrismaService.monitor.findUnique.mockResolvedValue(differentUsersMonitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(controller.findOne('monitor-1', mockRequest)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(controller.findOne('monitor-1', mockRequest)).rejects.toThrow(
        'You are not authorized to access this monitor'
      );
    });
  });

  describe('update', () => {
    it('should update a monitor', async () => {
      const updateDto = {
        name: 'Updated Monitor',
        frequency: 120,
      };

      const monitorForVerification = {
        id: 'monitor-1',
        userId: 'user-123',
      };

      const currentMonitor = {
        id: 'monitor-1',
        name: 'Test Monitor',
        url: 'https://example.com',
        frequency: 60,
        userId: 'user-123',
      };

      const updatedMonitor = {
        id: 'monitor-1',
        name: 'Updated Monitor',
        url: 'https://example.com',
        frequency: 120,
        userId: 'user-123',
      };

      mockPrismaService.monitor.findUnique
        .mockResolvedValueOnce(monitorForVerification)
        .mockResolvedValueOnce(currentMonitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      mockPrismaService.monitor.update.mockResolvedValue(updatedMonitor);
      mockQueue.remove.mockResolvedValue(undefined);
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      const result = await controller.update('monitor-1', updateDto, mockRequest);

      expect(result).toEqual({
        message: 'Monitor monitor-1 updated successfully',
        monitor: updatedMonitor,
      });
    });
  });

  describe('remove', () => {
    it('should delete a monitor', async () => {
      const monitorForVerification = {
        id: 'monitor-1',
        userId: 'user-123',
      };

      const fullMonitor = {
        id: 'monitor-1',
        name: 'Test Monitor',
        url: 'https://example.com',
        userId: 'user-123',
      };

      mockPrismaService.monitor.findUnique
        .mockResolvedValueOnce(monitorForVerification)
        .mockResolvedValueOnce(fullMonitor);

      mockQueue.remove.mockResolvedValue(undefined);
      mockPrismaService.monitor.delete.mockResolvedValue(fullMonitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const result = await controller.remove('monitor-1', mockRequest);

      expect(result).toBe('Monitor deleted successfully');
      expect(mockPrismaService.monitor.delete).toHaveBeenCalledWith({
        where: { id: 'monitor-1' },
      });
    });

    it('should throw NotFoundException when monitor not found', async () => {
      mockPrismaService.monitor.findUnique.mockResolvedValue(null);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(controller.remove('non-existent', mockRequest)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      const differentUsersMonitor = {
        id: 'monitor-1',
        userId: 'other-user-456',
      };

      mockPrismaService.monitor.findUnique.mockResolvedValue(differentUsersMonitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(controller.remove('monitor-1', mockRequest)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('getStats', () => {
    it('should return stats from httpPool and buffer services', () => {
      const httpStats = { activeConnections: 5, maxConnections: 10 };
      const bufferStats = { size: 100, maxSize: 1000 };
      const poolInfo = { name: 'default', max: 10, min: 2 };
      const utilization = 10;

      mockHttpPoolService.getStats.mockReturnValue(httpStats);
      mockPingLogBufferService.getStats.mockReturnValue(bufferStats);
      mockHttpPoolService.getPoolInfo.mockReturnValue(poolInfo);
      mockPingLogBufferService.getBufferUtilization.mockReturnValue(utilization);

      const result = controller.getStats();

      expect(result).toEqual({
        httpPool: httpStats,
        buffer: bufferStats,
        pools: poolInfo,
        bufferUtilization: utilization,
      });
    });
  });

  describe('forceFlush', () => {
    it('should flush the buffer and return success message', async () => {
      mockPingLogBufferService.forceFlush.mockResolvedValue(undefined);

      const result = await controller.forceFlush();

      expect(result).toEqual({ message: 'Buffer flushed successfully' });
      expect(mockPingLogBufferService.forceFlush).toHaveBeenCalled();
    });
  });
});
