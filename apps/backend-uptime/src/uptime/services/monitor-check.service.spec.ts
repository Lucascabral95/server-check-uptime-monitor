import { MonitorType } from '@prisma/client';
import { MonitorCheckService } from './monitor-check.service';

describe('MonitorCheckService', () => {
  const httpPool = { checkUrl: jest.fn() };
  const service = new MonitorCheckService(httpPool as never);

  beforeEach(() => jest.clearAllMocks());

  it('delegates HTTP monitor configuration to the pool', async () => {
    httpPool.checkUrl.mockResolvedValue({ success: true, statusCode: 200, durationMs: 20 });
    await service.execute({
      monitorType: MonitorType.HTTP,
      url: 'https://example.com',
      config: { http: { method: 'HEAD', expectedStatusCodes: [200] } },
      heartbeatLastReceivedAt: null,
      heartbeatIntervalSeconds: null,
      heartbeatGraceSeconds: null,
    });
    expect(httpPool.checkUrl).toHaveBeenCalledWith(
      'https://example.com',
      10000,
      expect.objectContaining({ method: 'HEAD' }),
    );
  });

  it('marks an overdue heartbeat as failed', async () => {
    const result = await service.execute({
      monitorType: MonitorType.HEARTBEAT,
      url: 'https://example.com',
      config: {},
      heartbeatLastReceivedAt: new Date(Date.now() - 120_000),
      heartbeatIntervalSeconds: 30,
      heartbeatGraceSeconds: 10,
    });
    expect(result).toMatchObject({ success: false, statusCode: 504, error: 'Heartbeat overdue' });
  });
});
