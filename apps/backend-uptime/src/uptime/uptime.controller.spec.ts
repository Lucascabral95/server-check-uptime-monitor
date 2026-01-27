import { Test, TestingModule } from '@nestjs/testing';
import { UptimeController } from './uptime.controller';
import { UptimeService } from './uptime.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { EmailService } from 'src/email/email.service';
import {
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role, Status } from '@prisma/client';
import {
  SortBy,
  IncidentSortBy,
} from './dto';

describe('UptimeController', () => {
  let controller: UptimeController;
  let service: jest.Mocked<UptimeService>;

  const mockUptimeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStatsByUserId: jest.fn(),
    findStatsLogsByUptimeId: jest.fn(),
    getIncidents: jest.fn(),
    getIncidentsByUserId: jest.fn(),
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

  const mockRequest = {
    user: {
      dbUserId: 'user-123',
      role: Role.ADMIN,
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UptimeController],
      providers: [
        { provide: UptimeService, useValue: mockUptimeService },
        { provide: HttpPoolService, useValue: mockHttpPoolService },
        { provide: PingLogBufferService, useValue: mockPingLogBufferService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UptimeController>(UptimeController);
    service = module.get(UptimeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a monitor', async () => {
      const dto = { name: 'Test', url: 'https://test.com', frequency: 60 };
      const resultMock = { id: 'uptime-1', ...dto };

      service.create.mockResolvedValue(resultMock as any);

      const result = await controller.create(dto as any, mockRequest);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-123');
      expect(result).toEqual(resultMock);
    });

    it('should propagate errors', async () => {
      service.create.mockRejectedValue(new InternalServerErrorException());

      await expect(
        controller.create({} as any, mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return paginated monitors', async () => {
      const pagination = {
        page: 1,
        limit: 10,
        status: Status.UP,
        sortBy: SortBy.RECENT,
      };

      const responseMock = {
        data: [{ id: '1', name: 'Monitor' }],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 10,
        },
      };

      service.findAll.mockResolvedValue(responseMock as any);

      const result = await controller.findAll(pagination as any);

      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(responseMock);
    });
  });

  describe('findOne', () => {
    it('should return monitor by id', async () => {
      const monitor = { id: 'uptime-1', name: 'Test' };

      service.findOne.mockResolvedValue(monitor as any);

      const result = await controller.findOne('uptime-1', mockRequest);

      expect(service.findOne).toHaveBeenCalledWith('uptime-1', 'user-123');
      expect(result).toEqual(monitor);
    });

    it('should throw NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.findOne('invalid-id', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException', async () => {
      service.findOne.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.findOne('uptime-1', mockRequest),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a monitor', async () => {
      const dto = { name: 'Updated' };
      const updated = { id: 'uptime-1', name: 'Updated' };

      service.update.mockResolvedValue(updated as any);

      const result = await controller.update(
        'uptime-1',
        dto as any,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        'uptime-1',
        dto,
        'user-123',
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete a monitor', async () => {
      service.remove.mockResolvedValue({ message: 'deleted' } as any);

      const result = await controller.remove('uptime-1', mockRequest);

      expect(service.remove).toHaveBeenCalledWith('uptime-1', 'user-123');
      expect(result).toEqual({ message: 'deleted' });
    });
  });

  describe('getStats', () => {
    it('should return internal system stats', () => {
      mockHttpPoolService.getStats.mockReturnValue({ active: 2 });
      mockHttpPoolService.getPoolInfo.mockReturnValue({ pools: 1 });
      mockPingLogBufferService.getStats.mockReturnValue({ size: 10 });
      mockPingLogBufferService.getBufferUtilization.mockReturnValue(75);

      const result = controller.getStats();

      expect(result).toEqual({
        httpPool: { active: 2 },
        buffer: { size: 10 },
        pools: { pools: 1 },
        bufferUtilization: 75,
      });
    });
  });

  describe('getStatsUser', () => {
    it('should return stats by user', async () => {
      const stats = { total: 5, up: 4, down: 1 };

      service.getStatsByUserId.mockResolvedValue(stats as any);

      const result = await controller.getStatsUser(mockRequest);

      expect(service.getStatsByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(stats);
    });
  });

  describe('findStatsLogsByUptimeId', () => {
    it('should return logs for uptime', async () => {
      const logs = { uptimeId: 'uptime-1', logs: [] };

      service.findStatsLogsByUptimeId.mockResolvedValue(logs as any);

      const result = await controller.findStatsLogsByUptimeId(
        'uptime-1',
        mockRequest,
      );

      expect(service.findStatsLogsByUptimeId).toHaveBeenCalledWith(
        'uptime-1',
        'user-123',
      );
      expect(result).toEqual(logs);
    });
  });

  describe('getIncidents', () => {
    it('should return incidents for a monitor', async () => {
      const incidents = { data: [], total: 0 };

      service.getIncidents.mockResolvedValue(incidents as any);

      const result = await controller.getIncidents(
        'uptime-1',
        mockRequest,
      );

      expect(service.getIncidents).toHaveBeenCalledWith(
        'uptime-1',
        'user-123',
      );
      expect(result).toEqual(incidents);
    });
  });

  describe('getIncidentsByUserId', () => {
    it('should return user incidents with pagination', async () => {
      const pagination = {
        page: 1,
        limit: 10,
        sortBy: IncidentSortBy.RECENT,
      };

      const incidents = { data: [], pagination: {} };

      service.getIncidentsByUserId.mockResolvedValue(incidents as any);

      const result = await controller.getIncidentsByUserId(
        mockRequest,
        pagination as any,
      );

      expect(service.getIncidentsByUserId).toHaveBeenCalledWith(
        'user-123',
        pagination,
      );
      expect(result).toEqual(incidents);
    });
  });

  describe('forceFlush', () => {
    it('should force flush buffer', async () => {
      mockPingLogBufferService.forceFlush.mockResolvedValue(undefined);

      const result = await controller.forceFlush();

      expect(mockPingLogBufferService.forceFlush).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Buffer flushed successfully' });
    });
  });
});
