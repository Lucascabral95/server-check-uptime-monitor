import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UptimeProcessor } from './uptime.processor';
import { PrismaService } from 'src/prisma/prisma.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { CheckRunService } from './services/check-run.service';
import { HttpPoolService } from './services/http-pool.service';
import { MonitorCheckService } from './services/monitor-check.service';
import { EmailService } from 'src/email/email.service';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';

describe('UptimeProcessor', () => {
  let processor: UptimeProcessor;

  const txMock = {
    monitor: {
      updateMany: jest.fn(),
    },
    incident: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const prismaMock = {
    monitor: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock)),
  };

  const pingLogBufferServiceMock = {
    add: jest.fn(),
  };

  const checkRunServiceMock = {
    begin: jest.fn(),
    recordFailure: jest.fn(),
    persistSuccess: jest.fn(),
  };

  const httpPoolServiceMock = {
    checkUrl: jest.fn(),
  };

  const monitorCheckServiceMock = {
    execute: jest.fn(),
  };

  const emailServiceMock = {
    sendNotificationEmail: jest.fn(),
  };

  const dlqMock = {
    add: jest.fn(),
  };

  const baseMonitor = {
    id: 'monitor-1',
    userId: 'user-1',
    name: 'Monitor 1',
    url: 'https://example.com',
    frequency: 60,
    isActive: true,
    status: 'UP',
    consecutiveFailures: 1,
    consecutiveSuccesses: 1,
    user: {
      email: 'user@example.com',
    },
  };

  const makeJob = (overrides?: Partial<Job>): Job =>
    ({
      id: 'job-1',
      data: { monitorId: 'monitor-1' },
      attemptsMade: 0,
      opts: { attempts: 3 },
      remove: jest.fn(),
      ...overrides,
    }) as unknown as Job;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof txMock) => Promise<unknown>) => callback(txMock),
    );
    // Por defecto, el CAS "gana" (nadie más tocó el monitor primero).
    txMock.monitor.updateMany.mockResolvedValue({ count: 1 });
    checkRunServiceMock.begin.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UptimeProcessor,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PingLogBufferService, useValue: pingLogBufferServiceMock },
        { provide: CheckRunService, useValue: checkRunServiceMock },
        { provide: HttpPoolService, useValue: httpPoolServiceMock },
        { provide: MonitorCheckService, useValue: monitorCheckServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
        {
          provide: getQueueToken(QUEUES_NAME.UPTIME_MONITOR_DLQ),
          useValue: dlqMock,
        },
      ],
    }).compile();

    processor = module.get<UptimeProcessor>(UptimeProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should remove job when monitorId is missing', async () => {
      const job = makeJob({ data: {} as any });

      await processor.process(job);

      expect(job.remove).toHaveBeenCalled();
      expect(prismaMock.monitor.findUnique).not.toHaveBeenCalled();
    });

    it('should move to DLQ and rethrow when prisma fails after retries', async () => {
      const job = makeJob({ attemptsMade: 3 });
      const error = new Error('db error');
      prismaMock.monitor.findUnique.mockRejectedValue(error);

      await expect(processor.process(job)).rejects.toThrow('db error');

      expect(dlqMock.add).toHaveBeenCalledWith(
        `failed-${job.id}`,
        expect.objectContaining({
          originalJob: job.data,
          error: 'db error',
          attempts: 3,
        }),
        expect.objectContaining({
          attempts: 5,
          backoff: { type: 'exponential', delay: 30000 },
        }),
      );
    });

    it('should remove orphaned job when monitor not found', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue(null);

      await processor.process(job);

      expect(job.remove).toHaveBeenCalled();
      expect(monitorCheckServiceMock.execute).not.toHaveBeenCalled();
    });

    it('should skip inactive monitor', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        isActive: false,
      });

      await processor.process(job);

      expect(monitorCheckServiceMock.execute).not.toHaveBeenCalled();
      expect(checkRunServiceMock.begin).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('should record error and move to DLQ when check fails after retries', async () => {
      const job = makeJob({ attemptsMade: 3 });
      const error = new Error('timeout');
      prismaMock.monitor.findUnique.mockResolvedValue(baseMonitor);
      monitorCheckServiceMock.execute.mockRejectedValue(error);

      await expect(processor.process(job)).rejects.toThrow('timeout');

      expect(monitorCheckServiceMock.execute).toHaveBeenCalled();
      expect(checkRunServiceMock.recordFailure).toHaveBeenCalledWith({
        runId: String(job.id),
        region: 'primary',
        monitorId: baseMonitor.id,
        statusCode: 0,
        durationMs: 0,
        success: false,
        error: 'timeout',
      });
      expect(dlqMock.add).toHaveBeenCalled();
    });

    it('UP -> DOWN: updates status, opens an incident and sends email', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'UP',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: false,
        statusCode: 500,
        durationMs: 250,
        error: 'Server error',
      });

      await processor.process(job);

      expect(checkRunServiceMock.persistSuccess).toHaveBeenCalledWith(expect.anything(), {
        runId: String(job.id),
        region: 'primary',
        monitorId: baseMonitor.id,
        statusCode: 500,
        durationMs: 250,
        success: false,
        error: 'Server error',
      });
      expect(txMock.monitor.updateMany).toHaveBeenCalledWith({
        where: { id: baseMonitor.id, status: 'UP' },
        data: {
          status: 'DOWN',
          lastCheck: expect.any(Date),
          consecutiveFailures: 2,
          consecutiveSuccesses: 0,
        },
      });
      expect(txMock.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          monitorId: baseMonitor.id,
          userId: baseMonitor.userId,
          status: 'ONGOING',
          firstStatusCode: 500,
          firstError: 'Server error',
          lastError: 'Server error',
        }),
      });
      expect(emailServiceMock.sendNotificationEmail).toHaveBeenCalledWith(
        baseMonitor.user.email,
        baseMonitor.name,
        'DOWN',
      );
    });

    it('DOWN -> UP: resolves the ongoing incident and sends email', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'DOWN',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: true,
        statusCode: 200,
        durationMs: 100,
      });

      await processor.process(job);

      expect(txMock.incident.updateMany).toHaveBeenCalledWith({
        where: { monitorId: baseMonitor.id, status: 'ONGOING' },
        data: { status: 'RESOLVED', endedAt: expect.any(Date) },
      });
      expect(emailServiceMock.sendNotificationEmail).toHaveBeenCalledWith(
        baseMonitor.user.email,
        baseMonitor.name,
        'UP',
      );
    });

    it('DOWN -> DOWN: does not open/resolve an incident, just enriches the ongoing one, and sends no email', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'DOWN',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: false,
        statusCode: 503,
        durationMs: 80,
        error: 'still down',
      });

      await processor.process(job);

      expect(txMock.incident.create).not.toHaveBeenCalled();
      expect(txMock.incident.updateMany).toHaveBeenCalledWith({
        where: { monitorId: baseMonitor.id, status: 'ONGOING' },
        data: { lastError: 'still down', affectedChecks: { increment: 1 } },
      });
      expect(emailServiceMock.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it('should not send email when previous status is PENDING', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'PENDING',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: true,
        statusCode: 200,
        durationMs: 120,
      });

      await processor.process(job);

      expect(emailServiceMock.sendNotificationEmail).not.toHaveBeenCalled();
      // PENDING -> UP no es un cierre de incidente (no había ninguno abierto).
      expect(txMock.incident.updateMany).not.toHaveBeenCalled();
      expect(txMock.incident.create).not.toHaveBeenCalled();
    });

    it('when the CAS loses the race (another worker already updated the monitor), skips incidents and email', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'UP',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: false,
        statusCode: 500,
        durationMs: 250,
        error: 'Server error',
      });
      txMock.monitor.updateMany.mockResolvedValue({ count: 0 });

      await processor.process(job);

      expect(txMock.incident.create).not.toHaveBeenCalled();
      expect(txMock.incident.updateMany).not.toHaveBeenCalled();
      expect(emailServiceMock.sendNotificationEmail).not.toHaveBeenCalled();
    });

    it('swallows a P2002 (duplicate ongoing incident) without throwing', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'UP',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: false,
        statusCode: 500,
        durationMs: 250,
        error: 'Server error',
      });
      txMock.incident.create.mockRejectedValue({ code: 'P2002' });

      await expect(processor.process(job)).resolves.toBeUndefined();
    });

    it('rethrows a non-P2002 error from incident.create', async () => {
      const job = makeJob();
      prismaMock.monitor.findUnique.mockResolvedValue({
        ...baseMonitor,
        status: 'UP',
      });
      monitorCheckServiceMock.execute.mockResolvedValue({
        success: false,
        statusCode: 500,
        durationMs: 250,
        error: 'Server error',
      });
      txMock.incident.create.mockRejectedValue({ code: 'P9999', message: 'boom' });

      await expect(processor.process(job)).rejects.toBeTruthy();
    });
  });
});
