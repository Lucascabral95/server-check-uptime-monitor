import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestUserDto } from 'src/user/dto';
import { WorkspaceAccessGuard } from 'src/workspace/guards/workspace-access.guard';
import { WorkspaceRoles } from 'src/workspace/decorators/workspace-roles.decorator';
import { CreateWorkspaceMonitorDto } from './dto';
import { UptimeService } from './uptime.service';
import { EntitlementService } from 'src/workspace/entitlement.service';

@ApiTags('Workspace Monitors')
@ApiBearerAuth('jwt-auth')
@Controller('workspaces/:workspaceId/monitors')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class WorkspaceMonitorController {
  constructor(
    private readonly uptimeService: UptimeService,
    private readonly entitlementService: EntitlementService,
  ) {}

  @Get()
  list(@Param('workspaceId') workspaceId: string, @Request() req: RequestUserDto) {
    return this.uptimeService.findAll(
      {},
      { dbUserId: req.user.dbUserId, role: req.user.role },
      workspaceId,
    );
  }

  @Post()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspaceMonitorDto,
    @Request() req: RequestUserDto,
  ) {
    return this.entitlementService
      .assertMonitorCreationAllowed(workspaceId, dto.frequency)
      .then(() => this.uptimeService.create(dto, req.user.dbUserId, workspaceId, dto.projectId));
  }
}
