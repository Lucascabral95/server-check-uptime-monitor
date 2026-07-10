import { WorkspacePlan } from '@prisma/client';
import { EntitlementService } from './entitlement.service';

describe('EntitlementService', () => {
  const prisma = {
    workspace: { findUnique: jest.fn() },
    workspaceMembership: { count: jest.fn() },
    monitor: { count: jest.fn() },
  };
  const service = new EntitlementService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns plan limits and usage', async () => {
    prisma.workspace.findUnique.mockResolvedValue({ plan: WorkspacePlan.PRO });
    prisma.workspaceMembership.count.mockResolvedValue(2);
    prisma.monitor.count.mockResolvedValue(4);

    await expect(service.get('workspace-1')).resolves.toMatchObject({
      plan: WorkspacePlan.PRO,
      usage: { members: 2, monitors: 4 },
    });
  });

  it('rejects monitors below the plan interval', async () => {
    prisma.workspace.findUnique.mockResolvedValue({ plan: WorkspacePlan.FREE });
    prisma.workspaceMembership.count.mockResolvedValue(1);
    prisma.monitor.count.mockResolvedValue(1);

    await expect(service.assertMonitorCreationAllowed('workspace-1', 60)).rejects.toThrow(
      'requires an interval',
    );
  });
});
