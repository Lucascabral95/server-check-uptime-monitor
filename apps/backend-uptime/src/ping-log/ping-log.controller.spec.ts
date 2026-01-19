import { Test, TestingModule } from '@nestjs/testing';
import { PingLogController } from './ping-log.controller';
import { PingLogService } from './ping-log.service';
import { NotFoundException } from '@nestjs/common';
import { PaginationPingLogDto } from './dto/pagination-ping-log.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

describe('PingLogController', () => {
  let controller: PingLogController;

  const pingLogServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findAllPingLogsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingLogController],
      providers: [
        {
          provide: PingLogService,
          useValue: pingLogServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true } as CanActivate)
      .compile();

    controller = module.get<PingLogController>(PingLogController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of ping logs', async () => {
      const logs = [
        { id: '1', statusCode: 200, success: true },
        { id: '2', statusCode: 500, success: false },
      ];
      pingLogServiceMock.findAll.mockResolvedValue(logs);

      const result = await controller.findAll();

      expect(result).toEqual(logs);
      expect(pingLogServiceMock.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no logs found', async () => {
      pingLogServiceMock.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(pingLogServiceMock.findAll).toHaveBeenCalled();
    });

    it('should propagate NotFoundException from service', async () => {
      pingLogServiceMock.findAll.mockRejectedValue(
        new NotFoundException('No ping logs found')
      );

      await expect(controller.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a single ping log by id', async () => {
      const log = { id: '123', statusCode: 200, success: true };
      pingLogServiceMock.findOne.mockResolvedValue(log);

      const result = await controller.findOne('123');

      expect(result).toEqual(log);
      expect(pingLogServiceMock.findOne).toHaveBeenCalledWith('123');
    });

    it('should propagate NotFoundException from service', async () => {
      pingLogServiceMock.findOne.mockRejectedValue(
        new NotFoundException('PingLog with id 123 not found')
      );

      await expect(controller.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a ping log by id', async () => {
      pingLogServiceMock.remove.mockResolvedValue('PingLog deleted successfully');

      const result = await controller.remove('123');

      expect(result).toBe('PingLog deleted successfully');
      expect(pingLogServiceMock.remove).toHaveBeenCalledWith('123');
    });

    it('should propagate NotFoundException from service', async () => {
      pingLogServiceMock.remove.mockRejectedValue(
        new NotFoundException('PingLog with id 123 not found')
      );

      await expect(controller.remove('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated ping logs for the user', async () => {
      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const paginationDto: PaginationPingLogDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [
          { id: '1', statusCode: 200, success: true },
          { id: '2', statusCode: 200, success: true },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          totalItems: 2,
          itemsPerPage: 10,
        },
      };

      pingLogServiceMock.findAllPingLogsByUser.mockResolvedValue(expectedResult);

      const result = await controller.findAllByUser(mockRequest, paginationDto);

      expect(result).toEqual(expectedResult);
      expect(pingLogServiceMock.findAllPingLogsByUser).toHaveBeenCalledWith(
        'user-123',
        paginationDto
      );
    });

    it('should pass monitorId filter to service if provided', async () => {
      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const paginationDto: PaginationPingLogDto = {
        page: 1,
        limit: 10,
        monitorId: 'monitor-456',
      };

      const expectedResult = {
        data: [{ id: '1', statusCode: 200, success: true }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          nextPage: null,
          prevPage: null,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };

      pingLogServiceMock.findAllPingLogsByUser.mockResolvedValue(expectedResult);

      const result = await controller.findAllByUser(mockRequest, paginationDto);

      expect(result).toEqual(expectedResult);
      expect(pingLogServiceMock.findAllPingLogsByUser).toHaveBeenCalledWith(
        'user-123',
        paginationDto
      );
    });

    it('should handle pagination with default values', async () => {
      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      const expectedResult = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          nextPage: null,
          prevPage: null,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };

      pingLogServiceMock.findAllPingLogsByUser.mockResolvedValue(expectedResult);

      const result = await controller.findAllByUser(mockRequest, {});

      expect(result.data).toEqual([]);
      expect(pingLogServiceMock.findAllPingLogsByUser).toHaveBeenCalledWith(
        'user-123',
        {}
      );
    });

    it('should propagate errors from service', async () => {
      const mockRequest = {
        user: { dbUserId: 'user-123' },
      } as any;

      pingLogServiceMock.findAllPingLogsByUser.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        controller.findAllByUser(mockRequest, {})
      ).rejects.toThrow('Database error');
    });
  });
});
