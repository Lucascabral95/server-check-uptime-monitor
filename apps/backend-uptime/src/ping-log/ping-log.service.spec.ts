import { Test, TestingModule } from '@nestjs/testing';
import { PingLogService } from './ping-log.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as errors from 'src/errors';

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

    it('should return null if empty', async () => {
  mockPrismaService.pingLog.findMany.mockResolvedValue(null);

  const result = await service.findAll();

  expect(result).toBeNull();
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
    it('should return fixture message', () => {
      const result = service.remove('1');
      expect(result).toBe('Fixture No available for remove.');
    });
  });
});
