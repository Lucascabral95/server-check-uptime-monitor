import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from 'src/workspace/guards/workspace-access.guard';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceRoles } from 'src/workspace/decorators/workspace-roles.decorator';
import { RequestUserDto } from 'src/user/dto';
import { StatusPageService } from './status-page.service';

class CreateStatusPageDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string;
}
class ComponentDto {
  @IsString() monitorId: string;
  @IsString() name: string;
}
class SubscribeDto {
  @IsEmail() email: string;
}

@Controller()
export class StatusPageController {
  constructor(private readonly pages: StatusPageService) {}
  @Get('status/:slug') public(@Param('slug') slug: string) {
    return this.pages.publicPage(slug);
  }
  @Post('status/:slug/subscribe') subscribe(
    @Param('slug') slug: string,
    @Body() dto: SubscribeDto,
  ) {
    return this.pages.subscribe(slug, dto.email);
  }
  @Post('status/subscriptions/:token/confirm') confirm(@Param('token') token: string) {
    return this.pages.confirm(token);
  }
  @Post('status/subscriptions/:token/unsubscribe') unsubscribe(@Param('token') token: string) {
    return this.pages.unsubscribe(token);
  }
  @Get('workspaces/:workspaceId/status-pages') @UseGuards(JwtAuthGuard, WorkspaceAccessGuard) list(
    @Param('workspaceId') id: string,
  ) {
    return this.pages.list(id);
  }
  @Post('workspaces/:workspaceId/status-pages')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  create(@Param('workspaceId') id: string, @Body() dto: CreateStatusPageDto) {
    return this.pages.create(id, dto.name, dto.slug, dto.description);
  }
  @Post('workspaces/:workspaceId/status-pages/:statusPageId/components')
  @UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)
  component(@Param('statusPageId') id: string, @Body() dto: ComponentDto) {
    return this.pages.addComponent(id, dto.monitorId, dto.name);
  }
}
