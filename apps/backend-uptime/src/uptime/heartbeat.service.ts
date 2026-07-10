import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HeartbeatService {
  constructor(private readonly prisma: PrismaService) {}

  async receive(secret: string) {
    const heartbeatSecretHash = createHash('sha256').update(secret).digest('hex');
    const monitor = await this.prisma.monitor.findFirst({
      where: { heartbeatSecretHash, monitorType: 'HEARTBEAT', isActive: true },
      select: { id: true },
    });
    if (!monitor) throw new NotFoundException('Heartbeat endpoint not found');
    const now = new Date();
    await this.prisma.monitor.update({
      where: { id: monitor.id },
      data: {
        heartbeatLastReceivedAt: now,
        status: 'UP',
        lastCheck: now,
        consecutiveFailures: 0,
        consecutiveSuccesses: { increment: 1 },
      },
    });
    return { accepted: true, receivedAt: now };
  }
}
