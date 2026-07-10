import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestUserDto } from 'src/user/dto/request-user.dto';
import { WorkspaceAccessGuard } from './guards/workspace-access.guard';
import { WorkspaceRoles } from './decorators/workspace-roles.decorator';
import { Role, WorkspaceRole } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  CreateInvitationDto,
  CreateProjectDto,
  CreateWorkspaceDto,
  UpdateMemberRoleDto,
  UpdateProjectDto,
  UpdateWorkspaceDto,
  CreateApiKeyDto,
  UpdateWorkspacePlanDto,
} from './dto';
import { WorkspaceService } from './workspace.service';
import { EntitlementService } from './entitlement.service';
import { ApiKeyService } from './api-key.service';

@ApiTags('Workspaces')
@ApiBearerAuth('jwt-auth')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly entitlementService: EntitlementService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Get()
  list(@Request() req: RequestUserDto) {
    return this.workspaceService.listForUser(req.user.dbUserId);
  }

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Request() req: RequestUserDto) {
    return this.workspaceService.create(req.user.dbUserId, dto.name);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  update(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.update(workspaceId, req.user.dbUserId, dto);
  }

  @Get(':workspaceId/projects')
  @UseGuards(WorkspaceAccessGuard)
  listProjects(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.listProjects(workspaceId);
  }

  @Post(':workspaceId/projects')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  createProject(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.createProject(workspaceId, req.user.dbUserId, dto);
  }

  @Patch(':workspaceId/projects/:projectId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  updateProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.updateProject(workspaceId, projectId, req.user.dbUserId, dto);
  }

  @Delete(':workspaceId/projects/:projectId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  deleteProject(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.deleteProject(workspaceId, projectId, req.user.dbUserId);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceAccessGuard)
  listMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.listMembers(workspaceId);
  }

  @Patch(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.updateMemberRole(workspaceId, memberId, req.user.dbUserId, dto);
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.removeMember(workspaceId, memberId, req.user.dbUserId);
  }

  @Post(':workspaceId/invitations')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  invite(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateInvitationDto,
    @Request() req: RequestUserDto,
  ) {
    return this.workspaceService.createInvitation(workspaceId, req.user.dbUserId, dto);
  }

  @Get(':workspaceId/usage')
  @UseGuards(WorkspaceAccessGuard)
  usage(@Param('workspaceId') workspaceId: string) {
    return this.entitlementService.get(workspaceId);
  }

  @Get(':workspaceId/audit-log')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  auditLog(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.listAuditLogs(workspaceId);
  }

  @Get(':workspaceId/api-keys')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  listApiKeys(@Param('workspaceId') workspaceId: string) {
    return this.apiKeyService.list(workspaceId);
  }

  @Post(':workspaceId/api-keys')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  createApiKey(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateApiKeyDto,
    @Request() req: RequestUserDto,
  ) {
    return this.apiKeyService.create(
      workspaceId,
      req.user.dbUserId,
      dto.name,
      dto.scopes,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
  }

  @Delete(':workspaceId/api-keys/:keyId')
  @UseGuards(WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  revokeApiKey(
    @Param('workspaceId') workspaceId: string,
    @Param('keyId') keyId: string,
    @Request() req: RequestUserDto,
  ) {
    return this.apiKeyService.revoke(workspaceId, req.user.dbUserId, keyId);
  }

  @Patch(':workspaceId/plan')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updatePlan(@Param('workspaceId') workspaceId: string, @Body() dto: UpdateWorkspacePlanDto) {
    return this.workspaceService.updatePlan(workspaceId, dto.plan);
  }

  @Post('invitations/:token/accept')
  accept(@Param('token') token: string, @Request() req: RequestUserDto) {
    return this.workspaceService.acceptInvitation(token, req.user.dbUserId, req.user.email);
  }
}
