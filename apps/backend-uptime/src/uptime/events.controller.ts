import { Controller, MessageEvent, Request, Sse, UseGuards } from '@nestjs/common';
import { Observable, filter, map } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestUserDto } from 'src/user/dto';
import { EventsService } from './services/events.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly events: EventsService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse()
  async stream(@Request() req: RequestUserDto): Promise<Observable<MessageEvent>> {
    const memberships = await this.prisma.workspaceMembership.findMany({
      where: { userId: req.user.dbUserId },
      select: { workspaceId: true },
    });
    const workspaceIds = new Set(memberships.map(item => item.workspaceId));
    return this.events.events$.pipe(
      filter(
        event =>
          event.userId === req.user.dbUserId ||
          Boolean(event.workspaceId && workspaceIds.has(event.workspaceId)),
      ),
      map(event => ({ type: event.type, data: event })),
    );
  }
}
