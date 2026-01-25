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
import { Role, Status } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

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

  const mockEmailService = {
    sendMail: jest.fn(),
    sendIncidentAlert: jest.fn(),
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
        {
          provide: EmailService,
          useValue: mockEmailService,
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

      const mockRequest = {
        user: {
          dbUserId: 'user-123',
          role: Role.USER,
        },
      } as any;

      const result = await controller.create(createDto as any, mockRequest);

      expect(result).toEqual(createdMonitor);
    });
  });

  describe('findOne', () => {
    it('should return a single monitor by id', async () => {
      const monitor = {
        id: 'monitor-1',
        userId: 'user-123',
        name: 'Test Monitor',
      };

      mockPrismaService.monitor.findUnique
        .mockResolvedValueOnce({ id: 'monitor-1', userId: 'user-123' })
        .mockResolvedValueOnce(monitor);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const result = await controller.findOne('monitor-1', mockRequest);

      expect(result).toEqual(monitor);
    });

    it('should throw NotFoundException when monitor not found', async () => {
      mockPrismaService.monitor.findUnique.mockResolvedValue(null);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(
        controller.findOne('non-existent', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when user is not the owner', async () => {
      mockPrismaService.monitor.findUnique.mockResolvedValue({
        id: 'monitor-1',
        userId: 'other-user',
      });

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      await expect(
        controller.findOne('monitor-1', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should delete a monitor', async () => {
      const monitor = {
        id: 'monitor-1',
        userId: 'user-123',
      };

      mockPrismaService.monitor.findUnique
        .mockResolvedValueOnce(monitor)
        .mockResolvedValueOnce(monitor);

      mockPrismaService.monitor.delete.mockResolvedValue(monitor);
      mockQueue.remove.mockResolvedValue(undefined);

      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const result = await controller.remove('monitor-1', mockRequest);

      expect(result).toBe('Monitor deleted successfully');
    });
  });

  describe('getStats', () => {
    it('should return stats from services', () => {
      mockHttpPoolService.getStats.mockReturnValue({ active: 1 });
      mockPingLogBufferService.getStats.mockReturnValue({ size: 10 });
      mockHttpPoolService.getPoolInfo.mockReturnValue({ pool: 'default' });
      mockPingLogBufferService.getBufferUtilization.mockReturnValue(50);

      const result = controller.getStats();

      expect(result).toEqual({
        httpPool: { active: 1 },
        buffer: { size: 10 },
        pools: { pool: 'default' },
        bufferUtilization: 50,
      });
    });
  });

  describe('forceFlush', () => {
    it('should flush buffer', async () => {
      mockPingLogBufferService.forceFlush.mockResolvedValue(undefined);

      const result = await controller.forceFlush();

      expect(result).toEqual({ message: 'Buffer flushed successfully' });
    });
  });
});
