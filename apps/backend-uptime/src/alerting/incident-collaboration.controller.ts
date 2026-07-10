import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { IncidentLifecycle } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestUserDto } from 'src/user/dto';

class CommentDto {
  @IsString() @MinLength(1) @MaxLength(5000) body: string;
}
class LifecycleDto {
  @IsEnum(IncidentLifecycle) lifecycle: IncidentLifecycle;
}

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentCollaborationController {
  constructor(private readonly prisma: PrismaService) {}
  @Get(':incidentId/timeline') async timeline(
    @Param('incidentId') id: string,
    @Request() req: RequestUserDto,
  ) {
    await this.assertAccess(id, req.user.dbUserId);
    return this.prisma.incidentTimeline.findMany({
      where: { incidentId: id },
      include: { actor: { select: { email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
  @Post(':incidentId/comments') async comment(
    @Param('incidentId') id: string,
    @Body() dto: CommentDto,
    @Request() req: RequestUserDto,
  ) {
    await this.assertAccess(id, req.user.dbUserId);
    const comment = await this.prisma.incidentComment.create({
      data: { incidentId: id, authorId: req.user.dbUserId, body: dto.body },
    });
    await this.prisma.incidentTimeline.create({
      data: {
        incidentId: id,
        actorId: req.user.dbUserId,
        event: 'COMMENT_ADDED',
        metadata: { commentId: comment.id },
      },
    });
    return comment;
  }
  @Patch(':incidentId/lifecycle') async lifecycle(
    @Param('incidentId') id: string,
    @Body() dto: LifecycleDto,
    @Request() req: RequestUserDto,
  ) {
    await this.assertAccess(id, req.user.dbUserId);
    const incident = await this.prisma.incident.update({
      where: { id },
      data: {
        lifecycle: dto.lifecycle,
        ...(dto.lifecycle === IncidentLifecycle.RESOLVED
          ? { status: 'RESOLVED', endedAt: new Date() }
          : {}),
      },
    });
    await this.prisma.incidentTimeline.create({
      data: {
        incidentId: id,
        actorId: req.user.dbUserId,
        event: `LIFECYCLE_${dto.lifecycle}`,
        metadata: {},
      },
    });
    return incident;
  }
  @Post(':incidentId/acknowledge') async acknowledge(
    @Param('incidentId') id: string,
    @Request() req: RequestUserDto,
  ) {
    await this.assertAccess(id, req.user.dbUserId);
    return this.prisma.incident.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedById: req.user.dbUserId,
        lifecycle: IncidentLifecycle.IDENTIFIED,
      },
    });
  }
  private async assertAccess(id: string, userId: string) {
    const incident = await this.prisma.incident.findFirst({
      where: { id, OR: [{ userId }, { workspace: { memberships: { some: { userId } } } }] },
      select: { id: true },
    });
    if (!incident) throw new NotFoundException('Incident not found');
  }
}
