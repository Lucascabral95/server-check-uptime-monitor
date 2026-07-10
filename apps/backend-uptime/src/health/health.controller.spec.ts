import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthRedisClient } from './health-redis.client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpPoolService } from 'src/uptime/services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';

describe('HealthController', () => {
  let controller: HealthController;

  const prismaMock = {
    $queryRaw: jest.fn(),
    getPoolStats: jest.fn().mockReturnValue({ total: 1, idle: 1, waiting: 0, max: 10 }),
  };

  const httpPoolServiceMock = {
    healthCheck: jest.fn().mockResolvedValue(true),
    getStats: jest.fn().mockReturnValue({ activeRequests: 0, totalRequests: 0 }),
  };

  const pingLogBufferServiceMock = {
    healthCheck: jest.fn().mockResolvedValue(true),
    getStats: jest.fn().mockReturnValue({ currentSize: 0, totalAdded: 0 }),
  };

  const redisClientMock = {
    client: { ping: jest.fn().mockResolvedValue('PONG') },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    httpPoolServiceMock.healthCheck.mockResolvedValue(true);
    pingLogBufferServiceMock.healthCheck.mockResolvedValue(true);
    redisClientMock.client.ping.mockResolvedValue('PONG');

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpPoolService, useValue: httpPoolServiceMock },
        { provide: PingLogBufferService, useValue: pingLogBufferServiceMock },
        { provide: HealthRedisClient, useValue: redisClientMock },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('liveness returns ok without touching the database or redis', async () => {
    const result = await controller.liveness();
    expect(result.status).toBe('ok');
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
    expect(redisClientMock.client.ping).not.toHaveBeenCalled();
  });

  it('readiness returns ok when db, redis, http pool and buffer are all healthy', async () => {
    const result = await controller.readiness();
    expect(result.status).toBe('ok');
    expect(result.details.database.status).toBe('up');
    expect(result.details.redis.status).toBe('up');
  });

  it('readiness throws ServiceUnavailableException (503) when the database is unreachable', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException);
  });

  it('readiness throws ServiceUnavailableException (503) when redis is unreachable', async () => {
    redisClientMock.client.ping.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException);
  });

  it('readiness fails when the http pool reports unhealthy', async () => {
    httpPoolServiceMock.healthCheck.mockResolvedValue(false);

    await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException);
  });

  it('readiness fails when the ping log buffer reports unhealthy', async () => {
    pingLogBufferServiceMock.healthCheck.mockResolvedValue(false);

    await expect(controller.readiness()).rejects.toThrow(ServiceUnavailableException);
  });
});
