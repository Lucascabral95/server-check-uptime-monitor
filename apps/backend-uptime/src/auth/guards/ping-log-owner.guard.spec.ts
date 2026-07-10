import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PingLogOwnerGuard } from './ping-log-owner.guard';

const createExecutionContext = (user?: unknown, id?: string): ExecutionContext => {
  const request = {
    user,
    params: id ? { id } : {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
};

describe('PingLogOwnerGuard', () => {
  let guard: PingLogOwnerGuard;
  let prisma: { pingLog: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      pingLog: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PingLogOwnerGuard,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    guard = module.get(PingLogOwnerGuard);
  });

  it('allows an administrator without querying ownership', async () => {
    const result = await guard.canActivate(
      createExecutionContext({ dbUserId: 'admin-id', role: Role.ADMIN }, 'ping-log-id'),
    );

    expect(result).toBe(true);
    expect(prisma.pingLog.findUnique).not.toHaveBeenCalled();
  });

  it('allows the monitor owner', async () => {
    prisma.pingLog.findUnique.mockResolvedValue({
      monitor: { userId: 'owner-id' },
    });

    const result = await guard.canActivate(
      createExecutionContext({ dbUserId: 'owner-id', role: Role.USER }, 'ping-log-id'),
    );

    expect(result).toBe(true);
    expect(prisma.pingLog.findUnique).toHaveBeenCalledWith({
      where: { id: 'ping-log-id' },
      select: {
        monitor: {
          select: { userId: true },
        },
      },
    });
  });

  it('denies a user who does not own the monitor', async () => {
    prisma.pingLog.findUnique.mockResolvedValue({
      monitor: { userId: 'another-user-id' },
    });

    await expect(
      guard.canActivate(
        createExecutionContext({ dbUserId: 'owner-id', role: Role.USER }, 'ping-log-id'),
      ),
    ).resolves.toBe(false);
  });

  it('denies requests without an authenticated user or ping log id', async () => {
    await expect(guard.canActivate(createExecutionContext(undefined, 'ping-log-id'))).resolves.toBe(
      false,
    );
    await expect(
      guard.canActivate(createExecutionContext({ dbUserId: 'owner-id', role: Role.USER })),
    ).resolves.toBe(false);

    expect(prisma.pingLog.findUnique).not.toHaveBeenCalled();
  });

  it('denies access when the ping log does not exist', async () => {
    prisma.pingLog.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createExecutionContext({ dbUserId: 'owner-id', role: Role.USER }, 'ping-log-id'),
      ),
    ).resolves.toBe(false);
  });

  it('fails closed when the ownership query fails', async () => {
    prisma.pingLog.findUnique.mockRejectedValue(new Error('Database unavailable'));

    await expect(
      guard.canActivate(
        createExecutionContext({ dbUserId: 'owner-id', role: Role.USER }, 'ping-log-id'),
      ),
    ).resolves.toBe(false);
  });
});
