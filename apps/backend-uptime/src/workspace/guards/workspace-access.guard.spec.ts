import { ExecutionContext } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceAccessGuard } from './workspace-access.guard';

describe('WorkspaceAccessGuard', () => {
  const prisma = { workspaceMembership: { findUnique: jest.fn() } };
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new WorkspaceAccessGuard(prisma as never, reflector as never);

  const context = (user: object, workspaceId = 'workspace-1') =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user, params: { workspaceId } }) }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('denies a user without membership', async () => {
    prisma.workspaceMembership.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(context({ dbUserId: 'user-1' }))).rejects.toThrow(
      'not a member',
    );
  });

  it('allows an editor to satisfy editor permissions', async () => {
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: WorkspaceRole.EDITOR });
    reflector.getAllAndOverride.mockReturnValue([WorkspaceRole.EDITOR]);
    await expect(guard.canActivate(context({ dbUserId: 'user-1' }))).resolves.toBe(true);
  });
});
