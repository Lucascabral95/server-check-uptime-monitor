import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MonitorOwnerGuard } from './monitor-owner.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

const createMockExecutionContext = (
  user: any = null,
  params: any = {},
): ExecutionContext => {
  const request = {
    user,
    params,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
};

describe('MonitorOwnerGuard', () => {
  let guard: MonitorOwnerGuard;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const mockMonitorId = 'monitor-abc';
  const anotherUserId = 'user-456';

  beforeEach(async () => {
    const prismaMock = {
      monitor: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorOwnerGuard,
        { provide: Reflector, useValue: new Reflector() },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    guard = module.get(MonitorOwnerGuard);
    prismaService = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('should deny access when no user is authenticated', () => {
    it('should return false if request.user is null', async () => {
      const context = createMockExecutionContext(null, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(prismaService.monitor.findUnique).not.toHaveBeenCalled();
    });

    it('should return false if request.user is undefined', async () => {
      const context = createMockExecutionContext(undefined, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(prismaService.monitor.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('should allow access for ADMIN users', () => {
    it('should return true for ADMIN role regardless of ownership', async () => {
      const adminUser = {
        dbUserId: mockUserId,
        role: Role.ADMIN,
      };

      const context = createMockExecutionContext(adminUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prismaService.monitor.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('should deny access when monitorId is missing', () => {
    it('should return false when params.id and params.uptimeId are both undefined', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      const context = createMockExecutionContext(regularUser, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(prismaService.monitor.findUnique).not.toHaveBeenCalled();
    });

    it('should return false when params are empty object', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      const context = createMockExecutionContext(regularUser, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('should allow access when user is the monitor owner', () => {
    it('should return true when user owns the monitor (using :id param)', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
      });

      const context = createMockExecutionContext(regularUser, {
        id: mockMonitorId,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prismaService.monitor.findUnique).toHaveBeenCalledWith({
        where: { id: mockMonitorId },
        select: { userId: true },
      });
    });

    it('should return true when user owns the monitor (using :uptimeId param)', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
      });

      const context = createMockExecutionContext(regularUser, {
        uptimeId: mockMonitorId,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prismaService.monitor.findUnique).toHaveBeenCalledWith({
        where: { id: mockMonitorId },
        select: { userId: true },
      });
    });

    it('should prioritize :id param when both :id and :uptimeId are present', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      const monitorIdInIdParam = 'monitor-from-id-param';
      const monitorIdInUptimeIdParam = 'monitor-from-uptimeId-param';

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
      });

      const context = createMockExecutionContext(regularUser, {
        id: monitorIdInIdParam,
        uptimeId: monitorIdInUptimeIdParam,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prismaService.monitor.findUnique).toHaveBeenCalledWith({
        where: { id: monitorIdInIdParam },
        select: { userId: true },
      });
    });
  });

  describe('should deny access when user is NOT the monitor owner', () => {
    it('should return false when monitor belongs to another user', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: anotherUserId,
      });

      const context = createMockExecutionContext(regularUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when monitor does not exist (null result)', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue(null);

      const context = createMockExecutionContext(regularUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when monitor does not exist (undefined result)', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue(undefined);

      const context = createMockExecutionContext(regularUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('should handle database errors gracefully', () => {
    it('should return false when findUnique throws an error', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const context = createMockExecutionContext(regularUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when Prisma throws a known error', async () => {
      const regularUser = {
        dbUserId: mockUserId,
        role: Role.USER,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockRejectedValue(
        new Error('Record not found'),
      );

      const context = createMockExecutionContext(regularUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle GUEST role correctly (deny if not owner)', async () => {
      const guestUser = {
        dbUserId: mockUserId,
        role: Role.GUEST,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: anotherUserId,
      });

      const context = createMockExecutionContext(guestUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow GUEST user if they own the monitor', async () => {
      const guestUser = {
        dbUserId: mockUserId,
        role: Role.GUEST,
      };

      (prismaService.monitor.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
      });

      const context = createMockExecutionContext(guestUser, { id: mockMonitorId });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
