import { CheckRunStatus } from '@prisma/client';
import { CheckRunService } from './check-run.service';

describe('CheckRunService', () => {
  const prismaMock = {
    checkRun: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const txMock = {
    checkRun: { upsert: jest.fn() },
    pingLog: { upsert: jest.fn() },
    probeResult: { upsert: jest.fn() },
  };

  let service: CheckRunService;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback: (tx: typeof txMock) => Promise<void>) =>
      callback(txMock),
    );
    service = new CheckRunService(prismaMock as never);
  });

  it('skips a run that was already completed', async () => {
    prismaMock.checkRun.findUnique.mockResolvedValue({ status: CheckRunStatus.SUCCEEDED });

    await expect(service.begin('run-1', 'monitor-1')).resolves.toBe(false);
    expect(prismaMock.checkRun.upsert).not.toHaveBeenCalled();
  });

  it('creates or reopens a run when it is not completed', async () => {
    prismaMock.checkRun.findUnique.mockResolvedValue({ status: CheckRunStatus.FAILED });

    await expect(service.begin('run-1', 'monitor-1')).resolves.toBe(true);
    expect(prismaMock.checkRun.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { runId_region: { runId: 'run-1', region: 'primary' } } }),
    );
  });

  it('persists a failed check run and ping log atomically', async () => {
    await service.recordFailure({
      runId: 'run-1',
      monitorId: 'monitor-1',
      statusCode: 500,
      durationMs: 100,
      success: false,
      error: 'timeout',
      region: 'primary',
    });

    expect(txMock.checkRun.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { runId_region: { runId: 'run-1', region: 'primary' } },
        update: expect.objectContaining({ status: CheckRunStatus.FAILED }),
      }),
    );
    expect(txMock.pingLog.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { runId: 'run-1' } }),
    );
  });
});
