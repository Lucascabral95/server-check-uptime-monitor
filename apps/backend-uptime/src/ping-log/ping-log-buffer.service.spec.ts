import { Test, TestingModule } from '@nestjs/testing';
import { PingLogBufferService } from './ping-log-buffer.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PingLogBufferService', () => {
  let service: PingLogBufferService;

  const prismaMock = {
    pingLog: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.useFakeTimers(); // evita que corran los setInterval

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PingLogBufferService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PingLogBufferService>(PingLogBufferService);

    // Evitamos timers reales
    jest.spyOn<any, any>(service as any, 'startFlushInterval').mockImplementation(() => {});
    jest.spyOn<any, any>(service as any, 'startStatsInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add log to buffer', () => {
    const result = service.add({
      monitorId: 'monitor-1',
      statusCode: 200,
      durationMs: 150,
      success: true,
    });

    expect(result).toBe(true);

    const stats = service.getStats();
    expect(stats.totalAdded).toBe(1);
    expect(stats.currentSize).toBe(1);
  });

  it('should reject log without monitorId', () => {
    const result = service.add({
      monitorId: '',
      statusCode: 500,
      durationMs: 300,
      success: false,
    });

    expect(result).toBe(false);

    const stats = service.getStats();
    expect(stats.totalAdded).toBe(0);
  });

  it('should flush logs to database', async () => {
    prismaMock.pingLog.createMany.mockResolvedValue({ count: 1 });

    service.add({
      monitorId: 'monitor-1',
      statusCode: 200,
      durationMs: 120,
      success: true,
    });

    await service.flush();

    expect(prismaMock.pingLog.createMany).toHaveBeenCalledTimes(1);

    const stats = service.getStats();
    expect(stats.totalFlushed).toBe(1);
    expect(stats.currentSize).toBe(0);
  });

  it('should report healthy when buffer is low', async () => {
    const healthy = await service.healthCheck();
    expect(healthy).toBe(true);
  });

  it('should return buffer utilization', () => {
    service.add({
      monitorId: 'monitor-1',
      statusCode: 200,
      durationMs: 100,
      success: true,
    });

    const utilization = service.getBufferUtilization();

    expect(utilization).toBeGreaterThan(0);
  });

  it('should force flush', async () => {
    prismaMock.pingLog.createMany.mockResolvedValue({ count: 1 });

    service.add({
      monitorId: 'monitor-1',
      statusCode: 200,
      durationMs: 100,
      success: true,
    });

    await service.forceFlush();

    expect(prismaMock.pingLog.createMany).toHaveBeenCalled();
  });
});
