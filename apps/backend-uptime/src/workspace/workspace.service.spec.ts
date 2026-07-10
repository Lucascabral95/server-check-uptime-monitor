import { WorkspaceRole } from '@prisma/client';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  const tx = {
    workspace: { create: jest.fn() },
    workspaceMembership: { create: jest.fn(), upsert: jest.fn() },
    project: { create: jest.fn() },
    invitation: { update: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    workspaceMembership: { findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    workspace: { create: jest.fn(), update: jest.fn() },
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    invitation: { create: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
    auditLog: { create: jest.fn() },
  };
  let service: WorkspaceService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    );
    tx.workspace.create.mockResolvedValue({
      id: 'workspace-1',
      name: 'Acme',
      slug: 'acme',
      ownerId: 'user-1',
    });
    tx.workspaceMembership.create.mockResolvedValue({});
    tx.project.create.mockResolvedValue({});
    tx.auditLog.create.mockResolvedValue({});
    service = new WorkspaceService(prisma as never);
  });

  it('creates a workspace with owner membership and default project atomically', async () => {
    await service.create('user-1', 'Acme');

    expect(tx.workspace.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ownerId: 'user-1' }) }),
    );
    expect(tx.workspaceMembership.create).toHaveBeenCalledWith({
      data: { workspaceId: 'workspace-1', userId: 'user-1', role: WorkspaceRole.OWNER },
    });
    expect(tx.project.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'default' }) }),
    );
  });

  it('rejects invitation acceptance when the authenticated email differs', async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      id: 'inv-1',
      workspaceId: 'workspace-1',
      email: 'owner@example.com',
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      role: WorkspaceRole.VIEWER,
    });

    await expect(
      service.acceptInvitation('token', 'user-2', 'attacker@example.com'),
    ).rejects.toThrow('Invitation email does not match');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
