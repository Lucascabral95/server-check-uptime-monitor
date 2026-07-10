import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from 'src/workspace/guards/workspace-access.guard';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceRoles } from 'src/workspace/decorators/workspace-roles.decorator';
import { CreateAlertPolicyDto, CreateNotificationChannelDto } from './dto';
import { AlertingService } from './alerting.service';

@ApiTags('Alerting')
@ApiBearerAuth('jwt-auth')
@Controller('workspaces/:workspaceId')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class AlertingController {
  constructor(private readonly alerting: AlertingService) {}
  @Get('notification-channels') listChannels(@Param('workspaceId') id: string) {
    return this.alerting.listChannels(id);
  }
  @Post('notification-channels')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  createChannel(@Param('workspaceId') id: string, @Body() dto: CreateNotificationChannelDto) {
    return this.alerting.createChannel(id, dto);
  }
  @Get('alert-policies') listPolicies(@Param('workspaceId') id: string) {
    return this.alerting.listPolicies(id);
  }
  @Post('alert-policies')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  createPolicy(@Param('workspaceId') id: string, @Body() dto: CreateAlertPolicyDto) {
    return this.alerting.createPolicy(id, dto);
  }
  @Post('notification-channels/:channelId/test')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async test(@Param('workspaceId') workspaceId: string, @Param('channelId') channelId: string) {
    return this.alerting.testChannel(workspaceId, channelId);
  }
}
