import { Test, TestingModule } from '@nestjs/testing';
import { UptimeService } from './uptime.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('UptimeService', () => {
  let service: UptimeService;

  const prismaMock = {
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
  };

  const queueMock = {
    add: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UptimeService,

        {
          provide: PrismaService,
          useValue: prismaMock,
        },

        {
          provide: getQueueToken('uptime-monitor'),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<UptimeService>(UptimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
