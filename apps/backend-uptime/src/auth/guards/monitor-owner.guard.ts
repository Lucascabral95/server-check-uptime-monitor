import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MonitorOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const params = request.params;
    const monitorId = params.id || params.uptimeId || params.monitorId;

    if (!monitorId) {
      return false;
    }

    try {
      const monitor = await this.prisma.monitor.findUnique({
        where: { id: monitorId },
        select: { userId: true },
      });

      return monitor?.userId === user.dbUserId;
    } catch {
      return false;
    }
  }
}
