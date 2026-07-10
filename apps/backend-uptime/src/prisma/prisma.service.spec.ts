import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose pg pool stats', () => {
    const stats = service.getPoolStats();
    expect(stats).toEqual({
      total: expect.any(Number),
      idle: expect.any(Number),
      waiting: expect.any(Number),
      max: expect.any(Number),
    });
  });

  afterAll(async () => {
    await service.onApplicationShutdown();
  });
});
