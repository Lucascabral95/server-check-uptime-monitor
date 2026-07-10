import { Test, TestingModule } from '@nestjs/testing';
import { GracefulShutdownService } from './graceful-shutdown.service';
import { UptimeProcessor } from './uptime.processor';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { HttpPoolService } from './services/http-pool.service';

describe('GracefulShutdownService', () => {
  let service: GracefulShutdownService;
  const callOrder: string[] = [];

  const workerCloseMock = jest.fn().mockImplementation(async () => {
    callOrder.push('worker.close');
  });

  const uptimeProcessorMock = {
    worker: { close: workerCloseMock },
  };

  const httpPoolServiceMock = {
    closeAll: jest.fn().mockImplementation(async () => {
      callOrder.push('httpPool.closeAll');
    }),
  };

  const pingLogBufferServiceMock = {
    flushFinal: jest.fn().mockImplementation(async () => {
      callOrder.push('buffer.flushFinal');
    }),
  };

  beforeEach(async () => {
    callOrder.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GracefulShutdownService,
        { provide: UptimeProcessor, useValue: uptimeProcessorMock },
        { provide: PingLogBufferService, useValue: pingLogBufferServiceMock },
        { provide: HttpPoolService, useValue: httpPoolServiceMock },
      ],
    }).compile();

    service = module.get<GracefulShutdownService>(GracefulShutdownService);
    // No queremos esperar el drain delay real (default 3000ms) en tests.
    (service as any).sleep = jest.fn().mockResolvedValue(undefined);
  });

  it('runs the shutdown sequence in the required order: worker, then http pools, then buffer flush', async () => {
    await service.beforeApplicationShutdown('SIGTERM');

    expect(callOrder).toEqual([
      'worker.close',
      'httpPool.closeAll',
      'buffer.flushFinal',
    ]);
  });

  it('still flushes the buffer even if closing the http pools throws', async () => {
    httpPoolServiceMock.closeAll.mockRejectedValueOnce(new Error('boom'));

    await service.beforeApplicationShutdown('SIGTERM');

    expect(pingLogBufferServiceMock.flushFinal).toHaveBeenCalledTimes(1);
  });

  it('still flushes the buffer even if closing the worker throws', async () => {
    workerCloseMock.mockRejectedValueOnce(new Error('boom'));

    await service.beforeApplicationShutdown('SIGTERM');

    expect(pingLogBufferServiceMock.flushFinal).toHaveBeenCalledTimes(1);
  });
});
