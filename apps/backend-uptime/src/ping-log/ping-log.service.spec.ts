import { Test, TestingModule } from '@nestjs/testing';
import { PingLogService } from './ping-log.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
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

      expect(prisma.pingLog.create).toHaveBeenCalledWith({
        data: {
          monitorId: 'monitor-1',
          statusCode: 200,
          durationMs: 150,
          success: true,
          error: null,
          timestamp: expect.any(Date),
        },
      });
      expect(result).toBe('PingLog created successfully');
    });

    it('should create a ping log with error message', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 500,
        durationMs: 300,
        success: false,
        error: 'Connection timeout',
      };

      mockPrismaService.pingLog.create.mockResolvedValue({});

      const result = await service.create(dto);

      expect(prisma.pingLog.create).toHaveBeenCalledWith({
        data: {
          monitorId: 'monitor-1',
          statusCode: 500,
          durationMs: 300,
          success: false,
          error: 'Connection timeout',
          timestamp: expect.any(Date),
        },
      });
      expect(result).toBe('PingLog created successfully');
    });

    it('should throw BadRequestException on Prisma validation error (P2003)', async () => {
      const dto = {
        monitorId: 'invalid-monitor-id',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const prismaError = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
        meta: { field_name: 'monitorId' },
      };
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new BadRequestException(`Invalid reference provided for field 'monitorId' on PingLog`);
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw NotFoundException on Prisma record not found error (P2025)', async () => {
      const dto = {
        monitorId: 'non-existent-monitor',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
      };
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new NotFoundException('PingLog not found');
      });

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw InternalServerErrorException on Prisma connection timeout (P2024)', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const prismaError = {
        code: 'P2024',
        message: 'Connection timeout',
      };
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('Database connection timeout. Please try again later.');
      });

      await expect(service.create(dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw ConflictException on Prisma transaction conflict (P2034)', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const prismaError = {
        code: 'P2034',
        message: 'Transaction conflict',
      };
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new ConflictException('Transaction failed due to concurrent updates on PingLog. Please retry.');
      });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw InternalServerErrorException on unknown Prisma error', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const prismaError = {
        code: 'P9999',
        message: 'Unknown error',
      };
      mockPrismaService.pingLog.create.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('An error occurred while processing PingLog');
      });

      await expect(service.create(dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should rethrow BadRequestException if already thrown', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const badRequestError = new BadRequestException('Invalid input');
      mockPrismaService.pingLog.create.mockRejectedValue(badRequestError);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow NotFoundException if already thrown', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const notFoundError = new NotFoundException('Not found');
      mockPrismaService.pingLog.create.mockRejectedValue(notFoundError);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow InternalServerErrorException if already thrown', async () => {
      const dto = {
        monitorId: 'monitor-1',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      const internalError = new InternalServerErrorException('Internal error');
      mockPrismaService.pingLog.create.mockRejectedValue(internalError);

      await expect(service.create(dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all ping logs', async () => {
      const logs = [{ id: '1' }, { id: '2' }];
      mockPrismaService.pingLog.findMany.mockResolvedValue(logs);

      const result = await service.findAll();

      expect(result).toEqual(logs);
      expect(prisma.pingLog.findMany).toHaveBeenCalledWith();
    });

    it('should return empty array if no logs found', async () => {
      mockPrismaService.pingLog.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prisma.pingLog.findMany).toHaveBeenCalledWith();
    });

    it('should handle Prisma connection timeout error (P2024)', async () => {
      const prismaError = {
        code: 'P2024',
        message: 'Connection timeout',
      };
      mockPrismaService.pingLog.findMany.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('Database connection timeout. Please try again later.');
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should rethrow NotFoundException if already thrown', async () => {
      const notFoundError = new NotFoundException('No ping logs found');
      mockPrismaService.pingLog.findMany.mockRejectedValue(notFoundError);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow InternalServerErrorException if already thrown', async () => {
      const internalError = new InternalServerErrorException('Database error');
      mockPrismaService.pingLog.findMany.mockRejectedValue(internalError);

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unknown Prisma error', async () => {
      const prismaError = {
        code: 'P9999',
        message: 'Unknown database error',
      };
      mockPrismaService.pingLog.findMany.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('An error occurred while processing PingLog');
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
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
      await expect(service.findOne('123')).rejects.toThrow('PingLog with id 123 not found');
    });

    it('should throw NotFoundException on Prisma record not found error (P2025)', async () => {
      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
      };
      mockPrismaService.pingLog.findUnique.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new NotFoundException('PingLog not found');
      });

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw BadRequestException on Prisma validation error (P2009)', async () => {
      const prismaError = {
        code: 'P2009',
        message: 'Query validation failed',
      };
      mockPrismaService.pingLog.findUnique.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new BadRequestException('Failed to validate the query for PingLog. Please check your input.');
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw InternalServerErrorException on Prisma connection timeout (P2024)', async () => {
      const prismaError = {
        code: 'P2024',
        message: 'Connection timeout',
      };
      mockPrismaService.pingLog.findUnique.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('Database connection timeout. Please try again later.');
      });

      await expect(service.findOne('123')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should rethrow BadRequestException if already thrown', async () => {
      const badRequestError = new BadRequestException('Invalid ID format');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(badRequestError);

      await expect(service.findOne('invalid')).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow InternalServerErrorException if already thrown', async () => {
      const internalError = new InternalServerErrorException('Database error');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(internalError);

      await expect(service.findOne('123')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unknown Prisma error', async () => {
      const prismaError = {
        code: 'P9999',
        message: 'Unknown error',
      };
      mockPrismaService.pingLog.findUnique.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('An error occurred while processing PingLog');
      });

      await expect(service.findOne('123')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
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

      expect(prisma.pingLog.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          monitorId: 'monitor-2',
          statusCode: 201,
          durationMs: 100,
          success: true,
          error: null,
          timestamp: expect.any(Date),
        },
      });
      expect(result).toBe('PingLog updated successfully');
    });

    it('should update only some fields of a ping log', async () => {
      const dto = {
        statusCode: 204,
        success: true,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.pingLog.update.mockResolvedValue({});

      const result = await service.update('1', dto);

      expect(prisma.pingLog.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          statusCode: 204,
          success: true,
          timestamp: expect.any(Date),
        },
      });
      expect(result).toBe('PingLog updated successfully');
    });

    it('should throw NotFoundException if ping log does not exist', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', {} as any)).rejects.toThrow('PingLog with id non-existent not found');
      expect(prisma.pingLog.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on Prisma foreign key constraint error (P2003)', async () => {
      const dto = {
        monitorId: 'invalid-monitor-id',
        statusCode: 200,
        durationMs: 150,
        success: true,
        error: null,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2003',
        message: 'Foreign key constraint failed',
        meta: { field_name: 'monitorId' },
      };
      mockPrismaService.pingLog.update.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new BadRequestException('Invalid reference provided for field \'monitorId\' on PingLog');
      });

      await expect(service.update('1', dto)).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw NotFoundException on Prisma record not found error (P2025)', async () => {
      const dto = {
        statusCode: 200,
        success: true,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
      };
      mockPrismaService.pingLog.update.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new NotFoundException('PingLog not found');
      });

      await expect(service.update('1', dto)).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw InternalServerErrorException on Prisma connection timeout (P2024)', async () => {
      const dto = {
        statusCode: 200,
        success: true,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2024',
        message: 'Connection timeout',
      };
      mockPrismaService.pingLog.update.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('Database connection timeout. Please try again later.');
      });

      await expect(service.update('1', dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw ConflictException on Prisma transaction conflict (P2034)', async () => {
      const dto = {
        statusCode: 200,
        success: true,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2034',
        message: 'Transaction conflict',
      };
      mockPrismaService.pingLog.update.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new ConflictException('Transaction failed due to concurrent updates on PingLog. Please retry.');
      });

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should rethrow BadRequestException if already thrown', async () => {
      const badRequestError = new BadRequestException('Invalid update data');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(badRequestError);

      await expect(service.update('1', {} as any)).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow InternalServerErrorException if already thrown', async () => {
      const internalError = new InternalServerErrorException('Update failed');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(internalError);

      await expect(service.update('1', {} as any)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unknown Prisma error', async () => {
      const dto = {
        statusCode: 200,
        success: true,
      };

      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P9999',
        message: 'Unknown error',
      };
      mockPrismaService.pingLog.update.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('An error occurred while processing PingLog');
      });

      await expect(service.update('1', dto)).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
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

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.remove('non-existent')).rejects.toThrow('PingLog with id non-existent not found');
      expect(prisma.pingLog.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException on Prisma record not found error (P2025)', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
      };
      mockPrismaService.pingLog.delete.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new NotFoundException('PingLog not found');
      });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw InternalServerErrorException on Prisma connection timeout (P2024)', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2024',
        message: 'Connection timeout',
      };
      mockPrismaService.pingLog.delete.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('Database connection timeout. Please try again later.');
      });

      await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should throw ConflictException on Prisma transaction conflict (P2034)', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P2034',
        message: 'Transaction conflict',
      };
      mockPrismaService.pingLog.delete.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new ConflictException('Transaction failed due to concurrent updates on PingLog. Please retry.');
      });

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
    });

    it('should rethrow BadRequestException if already thrown', async () => {
      const badRequestError = new BadRequestException('Cannot delete');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(badRequestError);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should rethrow InternalServerErrorException if already thrown', async () => {
      const internalError = new InternalServerErrorException('Delete failed');
      mockPrismaService.pingLog.findUnique.mockRejectedValue(internalError);

      await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unknown Prisma error', async () => {
      mockPrismaService.pingLog.findUnique.mockResolvedValue({ id: '1' });
      const prismaError = {
        code: 'P9999',
        message: 'Unknown error',
      };
      mockPrismaService.pingLog.delete.mockRejectedValue(prismaError);

      mockedHandlePrismaError.mockImplementation((error, entityName) => {
        throw new InternalServerErrorException('An error occurred while processing PingLog');
      });

      await expect(service.remove('1')).rejects.toThrow(InternalServerErrorException);
      expect(mockedHandlePrismaError).toHaveBeenCalledWith(prismaError, 'PingLog');
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
