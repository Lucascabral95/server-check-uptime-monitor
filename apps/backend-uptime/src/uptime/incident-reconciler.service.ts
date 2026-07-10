import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const RECONCILE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Red de seguridad para incidentes materializados (ver uptime.processor.ts):
 * como los incidentes se abren/cierran desde la transición de estado del
 * monitor y ya NO se derivan escaneando ping_logs, perdimos el auto-sanado
 * que tenía el approach viejo. Si por lo que sea el job DOWN->UP de un
 * monitor nunca corre (job perdido, desync de cola, bug), el incidente
 * quedaría ONGOING para siempre. Este reconciliador cierra periódicamente
 * cualquier incidente ONGOING cuyo monitor ya no está DOWN.
 */
@Injectable()
export class IncidentReconcilerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IncidentReconcilerService.name);
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.interval = setInterval(() => {
      this.reconcile().catch((error) => {
        this.logger.error(`Incident reconciliation failed: ${error.message}`, error.stack);
      });
    }, RECONCILE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async reconcile(): Promise<number> {
    const stale = await this.prisma.incident.findMany({
      where: { status: 'ONGOING', monitor: { status: { not: 'DOWN' } } },
      select: { id: true },
    });

    if (stale.length === 0) return 0;

    await this.prisma.incident.updateMany({
      where: { id: { in: stale.map((i) => i.id) } },
      data: { status: 'RESOLVED', endedAt: new Date() },
    });

    this.logger.warn(`Reconciled ${stale.length} stale ONGOING incident(s)`);
    return stale.length;
  }
}
