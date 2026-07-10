import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

interface PingLogRequest {
  user?: {
    dbUserId: string;
    role: Role;
  };
  params: {
    id?: string;
  };
}

@Injectable()
export class PingLogOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PingLogRequest>();
    const user = request.user;
    const pingLogId = request.params.id;

    if (!user || !pingLogId) {
      return false;
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    try {
      const pingLog = await this.prisma.pingLog.findUnique({
        where: { id: pingLogId },
        select: {
          monitor: {
            select: { userId: true },
          },
        },
      });

      return pingLog?.monitor.userId === user.dbUserId;
    } catch {
      return false;
    }
  }
}
