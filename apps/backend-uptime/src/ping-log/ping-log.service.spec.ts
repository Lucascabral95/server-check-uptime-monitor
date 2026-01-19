import { Test, TestingModule } from '@nestjs/testing';
import { PingLogService } from './ping-log.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as errors from 'src/errors';
import { PaginationPingLogDto } from './dto/pagination-ping-log.dto';

jest.mock('src/errors', () => ({
  handlePrismaError: jest.fn(),
}));

describe('PingLogService', () => {
  let service: PingLogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockedHandlePrismaError = errors.handlePrismaError as unknown as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PingLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PingLogService>(PingLogService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a ping log successfully', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      mockPrismaService.pingLog.create.mockResolvedValue({});

      const result = await service.create(dto);

      expect(prisma.pingLog.create).toHaveBeenCalled();
      expect(result).toBe('PingLog created successfully');
    });

    it('should throw prisma handled error', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 500,
        durationMs: 300,
        success: false,
        error: 'timeout',
      };

      const prismaError = new Error('Prisma error');
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockReturnValue(new BadRequestException());

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all ping logs', async () => {
      const logs = [{ id: '1' }, { id: '2' }];
      mockPrismaService.pingLog.findMany.mockResolvedValue(logs);

      const result = await service.findAll();

      expect(result).toEqual(logs);
      expect(prisma.pingLog.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no logs found', async () => {
      mockPrismaService.pingLog.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prisma.pingLog.findMany).toHaveBeenCalled();
    });

  });

  describe('findOne', () => {
    it('should return a ping log by id', async () => {
      const log = { id: '123' };
      mockPrismaService.pingLog.findUnique.mockResolvedValue(log);

      const result = await service.findOne('123');

      expect(result).toEqual(log);
      expect(prisma.pingLog.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a ping log successfully', async () => {
      const dto = {
        monitorId: 'monitor-2',
        statusCode: 201,
        durationMs: 100,
        success: true,
        error: null,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.pingLog.update.mockResolvedValue({});

      const result = await service.update('1', dto);

      expect(prisma.pingLog.update).toHaveBeenCalled();
      expect(result).toBe('PingLog updated successfully');
    });

    it('should throw NotFoundException if ping log does not exist', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue(null);

      await expect(service.update('1', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a ping log successfully', async () => {
      const log = { id: '1' };
      mockPrismaService.pingLog.findUnique.mockResolvedValue(log);
      mockPrismaService.pingLog.delete.mockResolvedValue(log);

      const result = await service.remove('1');

      expect(prisma.pingLog.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(prisma.pingLog.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe('PingLog deleted successfully');
    });

    it('should throw NotFoundException if ping log does not exist', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPingLogsByUser', () => {
    it('should return paginated ping logs for a user', async () => {
      const userId = 'user-1';
      const paginationDto: PaginationPingLogDto = {
        page: 1,
        limit: 10,
      };

      const logs = [
        { id: '1', monitorId: 'monitor-1' },
        { id: '2', monitorId: 'monitor-2' },
      ];

      mockPrismaService.pingLog.findMany.mockResolvedValue(logs);
      mockPrismaService.pingLog.count.mockResolvedValue(2);

      const result = await service.findAllPingLogsByUser(userId, paginationDto);

      expect(result).toEqual({
        data: logs,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          totalItems: 2,
          itemsPerPage: 10,
        },
      });
      expect(prisma.pingLog.findMany).toHaveBeenCalledWith({
        where: {
          monitor: {
            userId: userId,
          },
        },
        skip: 0,
        take: 10,
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should return paginated ping logs filtered by monitorId', async () => {
      const userId = 'user-1';
      const paginationDto: PaginationPingLogDto = {
        page: 1,
        limit: 10,
        monitorId: 'monitor-1',
      };

      const logs = [{ id: '1', monitorId: 'monitor-1' }];

      mockPrismaService.pingLog.findMany.mockResolvedValue(logs);
      mockPrismaService.pingLog.count.mockResolvedValue(1);

      const result = await service.findAllPingLogsByUser(userId, paginationDto);

      expect(result.data).toEqual(logs);
      expect(prisma.pingLog.findMany).toHaveBeenCalledWith({
        where: {
          monitor: {
            userId: userId,
          },
          monitorId: 'monitor-1',
        },
        skip: 0,
        take: 10,
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should calculate pagination correctly', async () => {
      const userId = 'user-1';
      const paginationDto: PaginationPingLogDto = {
        page: 2,
        limit: 5,
      };

      const logs = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];

      mockPrismaService.pingLog.findMany.mockResolvedValue(logs);
      mockPrismaService.pingLog.count.mockResolvedValue(12);

      const result = await service.findAllPingLogsByUser(userId, paginationDto);

      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        nextPage: 3,
        prevPage: 1,
        totalItems: 12,
        itemsPerPage: 5,
      });
      expect(prisma.pingLog.findMany).toHaveBeenCalledWith({
        where: {
          monitor: {
            userId: userId,
          },
        },
        skip: 5,
        take: 5,
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should return empty array with pagination when no logs found', async () => {
      const userId = 'user-1';
      const paginationDto: PaginationPingLogDto = {
        page: 1,
        limit: 10,
      };

      mockPrismaService.pingLog.findMany.mockResolvedValue([]);
      mockPrismaService.pingLog.count.mockResolvedValue(0);

      const result = await service.findAllPingLogsByUser(userId, paginationDto);

      expect(result.data).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
