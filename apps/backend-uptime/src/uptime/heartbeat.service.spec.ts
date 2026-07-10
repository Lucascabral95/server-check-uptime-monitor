import { HeartbeatService } from './heartbeat.service';
import { createHash } from 'crypto';

describe('HeartbeatService', () => {
  const prisma = {
    monitor: { findFirst: jest.fn(), update: jest.fn() },
  };
  const service = new HeartbeatService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('accepts a valid heartbeat and updates monitor freshness', async () => {
    prisma.monitor.findFirst.mockResolvedValue({ id: 'monitor-1' });
    prisma.monitor.update.mockResolvedValue({});
    await expect(service.receive('secret')).resolves.toMatchObject({ accepted: true });
    expect(prisma.monitor.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          heartbeatSecretHash: createHash('sha256').update('secret').digest('hex'),
        }),
      }),
    );
  });

  it('does not reveal whether an invalid secret belongs to a monitor', async () => {
    prisma.monitor.findFirst.mockResolvedValue(null);
    await expect(service.receive('invalid')).rejects.toThrow('Heartbeat endpoint not found');
    expect(prisma.monitor.update).not.toHaveBeenCalled();
  });
});
