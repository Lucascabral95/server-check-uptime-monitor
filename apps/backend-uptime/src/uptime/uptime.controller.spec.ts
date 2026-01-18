import { Test, TestingModule } from '@nestjs/testing';
import { UptimeController } from './uptime.controller';
import { UptimeService } from './uptime.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';

describe('UptimeController', () => {
  let controller: UptimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UptimeController],
      providers: [
        UptimeService,

        {
          provide: PrismaService,
          useValue: {
            monitor: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },

        {
          provide: getQueueToken('uptime-monitor'),
          useValue: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        },

        {
          provide: HttpPoolService,
          useValue: {
            getStats: jest.fn(),
            getPoolInfo: jest.fn(),
          },
        },
        {
          provide: PingLogBufferService,
          useValue: {
            getStats: jest.fn(),
            getBufferUtilization: jest.fn(),
            forceFlush: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UptimeController>(UptimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
