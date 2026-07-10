import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspacePlan, WorkspaceRole } from '@prisma/client';
import {
  CreateInvitationDto,
  CreateProjectDto,
  UpdateMemberRoleDto,
  UpdateProjectDto,
  UpdateWorkspaceDto,
} from './dto';

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'workspace'
  );
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.workspaceMembership.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, name: string) {
    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${randomBytes(3).toString('hex')}`;
    return this.prisma.$transaction(async tx => {
      const workspace = await tx.workspace.create({
        data: { name: name.trim(), slug, ownerId: userId },
      });
      await tx.workspaceMembership.create({
        data: { workspaceId: workspace.id, userId, role: WorkspaceRole.OWNER },
      });
      await tx.project.create({
        data: { workspaceId: workspace.id, name: 'Default Project', slug: 'default' },
      });
      await this.audit(tx, workspace.id, userId, 'workspace.created', 'Workspace', workspace.id);
      return workspace;
    });
  }

  async update(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.update({ where: { id: workspaceId }, data: dto });
    await this.audit(
      this.prisma,
      workspaceId,
      userId,
      'workspace.updated',
      'Workspace',
      workspaceId,
      dto,
    );
    return workspace;
  }

  async updatePlan(workspaceId: string, plan: WorkspacePlan) {
    return this.prisma.workspace.update({ where: { id: workspaceId }, data: { plan } });
  }

  async listProjects(workspaceId: string) {
    return this.prisma.project.findMany({ where: { workspaceId }, orderBy: { createdAt: 'asc' } });
  }

  async createProject(workspaceId: string, userId: string, dto: CreateProjectDto) {
    const slug = slugify(dto.name);
    try {
      const project = await this.prisma.project.create({
        data: {
          workspaceId,
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
        },
      });
      await this.audit(
        this.prisma,
        workspaceId,
        userId,
        'project.created',
        'Project',
        project.id,
        dto,
      );
      return project;
    } catch (error) {
      if (error?.code === 'P2002')
        throw new ConflictException('A project with this name already exists');
      throw error;
    }
  }

  async updateProject(
    workspaceId: string,
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ) {
    const project = await this.prisma.project.updateMany({
      where: { id: projectId, workspaceId },
      data: {
        ...(dto.name ? { name: dto.name.trim(), slug: slugify(dto.name) } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      },
    });
    if (project.count === 0) throw new NotFoundException('Project not found');
    const updated = await this.prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    await this.audit(
      this.prisma,
      workspaceId,
      userId,
      'project.updated',
      'Project',
      projectId,
      dto,
    );
    return updated;
  }

  async deleteProject(workspaceId: string, projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, workspaceId } });
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { id: projectId } });
    await this.audit(this.prisma, workspaceId, userId, 'project.deleted', 'Project', projectId);
    return { deleted: true };
  }

  async listMembers(workspaceId: string) {
    return this.prisma.workspaceMembership.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listAuditLogs(workspaceId: string, limit = 100) {
    return this.prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
    });
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    actorId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const member = await this.prisma.workspaceMembership.findFirst({
      where: { id: memberId, workspaceId },
    });
    if (!member) throw new NotFoundException('Workspace member not found');
    if (member.role === WorkspaceRole.OWNER || dto.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('The workspace owner cannot be changed through this endpoint');
    }
    const updated = await this.prisma.workspaceMembership.update({
      where: { id: memberId },
      data: { role: dto.role },
    });
    await this.audit(
      this.prisma,
      workspaceId,
      actorId,
      'membership.role_changed',
      'WorkspaceMembership',
      memberId,
      dto,
    );
    return updated;
  }

  async removeMember(workspaceId: string, memberId: string, actorId: string) {
    const member = await this.prisma.workspaceMembership.findFirst({
      where: { id: memberId, workspaceId },
    });
    if (!member) throw new NotFoundException('Workspace member not found');
    if (member.role === WorkspaceRole.OWNER)
      throw new ForbiddenException('The workspace owner cannot be removed');
    await this.prisma.workspaceMembership.delete({ where: { id: memberId } });
    await this.audit(
      this.prisma,
      workspaceId,
      actorId,
      'membership.removed',
      'WorkspaceMembership',
      memberId,
    );
    return { deleted: true };
  }

  async createInvitation(workspaceId: string, inviterId: string, dto: CreateInvitationDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.workspaceMembership.findFirst({
      where: { workspaceId, user: { email } },
    });
    if (existing) throw new ConflictException('This user is already a workspace member');
    const token = randomBytes(32).toString('base64url');
    const invitation = await this.prisma.invitation.create({
      data: {
        workspaceId,
        invitedById: inviterId,
        email,
        role: dto.role,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    });
    await this.audit(
      this.prisma,
      workspaceId,
      inviterId,
      'invitation.created',
      'Invitation',
      invitation.id,
      { email, role: dto.role },
    );
    return { ...invitation, token };
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date())
      throw new BadRequestException('Invitation is invalid or expired');
    if (invitation.email !== userEmail.trim().toLowerCase())
      throw new ForbiddenException('Invitation email does not match the authenticated user');
    return this.prisma.$transaction(async tx => {
      const membership = await tx.workspaceMembership.upsert({
        where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId } },
        create: { workspaceId: invitation.workspaceId, userId, role: invitation.role },
        update: { role: invitation.role },
      });
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
      await this.audit(
        tx,
        invitation.workspaceId,
        userId,
        'invitation.accepted',
        'Invitation',
        invitation.id,
      );
      return membership;
    });
  }

  private async audit(
    tx: Pick<PrismaService, 'auditLog'>,
    workspaceId: string,
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: unknown,
  ) {
    await tx.auditLog.create({
      data: {
        workspaceId,
        actorUserId,
        action,
        entityType,
        entityId,
        metadata: (metadata as object) ?? undefined,
      },
    });
  }
}
