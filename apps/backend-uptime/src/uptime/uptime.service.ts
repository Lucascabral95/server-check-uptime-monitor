import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { CreateUptimeDto } from './dto/create-uptime.dto';
import { UpdateUptimeDto } from './dto/update-uptime.dto';
import {
  PaginationUptimeDto,
  PaginatedResponseDto,
  SortBy,
  PaginationIncidentsDto,
  IncidentSortBy,
} from './dto';
import { SecretEnvelopeService } from './services/secret-envelope.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { MonitorType, Prisma, Incident } from '@prisma/client';
import { AggregateGranularity } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { MonitorScheduleOutboxService } from './services/monitor-schedule-outbox.service';
import { MonitorScheduleService } from './services/monitor-schedule.service';
import {
  GetStatsUserDto,
  GetStatsLogsByUptimeIdDto,
  HealthStatsDto,
  GetUptimeDto,
  GetIncidentsDto,
  IncidentDto,
  GetIncidentsByUserIdDto,
  IncidentWithMonitorDto,
  MonitorIncidentSummaryDto,
} from './dto';

@Injectable()
export class UptimeService {
  private readonly logger = new Logger(UptimeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorScheduleOutboxService: MonitorScheduleOutboxService,
    private readonly monitorScheduleService: MonitorScheduleService,
    @Optional()
    private readonly secretEnvelopeService: SecretEnvelopeService = new SecretEnvelopeService(),
  ) {}

  async create(
    createUptimeDto: CreateUptimeDto,
    userId: string,
    workspaceId?: string,
    projectId?: string,
  ) {
    try {
      const {
        name,
        url,
        frequency,
        monitorType = MonitorType.HTTP,
        config = {},
        heartbeatIntervalSeconds,
        heartbeatGraceSeconds,
        maintenanceWindows = [],
      } = createUptimeDto;
      const heartbeatSecret =
        monitorType === MonitorType.HEARTBEAT ? randomBytes(32).toString('base64url') : undefined;

      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException(
          `User with id '${userId}' does not exist. Please create a user first.`,
        );
      }

      const now = new Date();
      const nextCheck = new Date(now.getTime() + frequency * 1000);

      if (workspaceId) {
        const membership = await this.prisma.workspaceMembership.findUnique({
          where: { workspaceId_userId: { workspaceId, userId } },
          select: { id: true },
        });
        if (!membership) throw new UnauthorizedException('Workspace membership required');
        if (projectId) {
          const project = await this.prisma.project.findFirst({
            where: { id: projectId, workspaceId },
            select: { id: true },
          });
          if (!project) throw new NotFoundException('Project not found in workspace');
        }
      }

      const monitor = await this.prisma.$transaction(async transaction => {
        const createdMonitor = await transaction.monitor.create({
          data: {
            userId,
            name,
            url,
            frequency,
            nextCheck,
            isActive: true,
            monitorType,
            config: this.secretEnvelopeService.protectConfig(config) as Prisma.InputJsonValue,
            ...(heartbeatSecret
              ? {
                  heartbeatSecretHash: createHash('sha256').update(heartbeatSecret).digest('hex'),
                  heartbeatIntervalSeconds: heartbeatIntervalSeconds ?? frequency,
                  heartbeatGraceSeconds: heartbeatGraceSeconds ?? frequency,
                }
              : {}),
            ...(workspaceId ? { workspaceId } : {}),
            ...(projectId ? { projectId } : {}),
          },
        });

        if (maintenanceWindows.length) {
          await transaction.maintenanceWindow.createMany({
            data: maintenanceWindows.map(window => ({ monitorId: createdMonitor.id, ...window })),
          });
        }

        await this.monitorScheduleOutboxService.enqueue(transaction, createdMonitor.id);

        return createdMonitor;
      });

      this.logger.log(`Monitor created: ${name} (next check at ${nextCheck})`);

      return heartbeatSecret ? { ...monitor, heartbeatSecret } : monitor;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  // `requestingUser` es SIEMPRE el usuario autenticado (req.user), nunca un
  // valor de query string: los filtros `userId`/`email` del DTO solo se
  // honran para ADMIN. Para USER/GUEST el resultado se fuerza a sus propios
  // monitores, sin importar qué venga en la query — antes cualquiera podía
  // pedir `?userId=<otro>` o `?email=<otro>` y enumerar monitores ajenos.
  async findAll(
    paginationDto: PaginationUptimeDto = {},
    requestingUser: { dbUserId: string; role: string },
    workspaceId?: string,
  ): Promise<PaginatedResponseDto<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        status,
        sortBy = SortBy.RECENT,
        search,
        includeInactive = false,
        email,
      } = paginationDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      const isAdmin = requestingUser.role === 'ADMIN';

      if (workspaceId) {
        where.workspaceId = workspaceId;
      } else if (isAdmin) {
        if (userId) {
          where.userId = userId;
        }
        if (email) {
          where.user = { email };
        }
      } else {
        where.userId = requestingUser.dbUserId;
      }

      if (status) {
        where.status = status;
      }

      if (!includeInactive) {
        where.isActive = true;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderByMap: Record<SortBy, any> = {
        [SortBy.RECENT]: { createdAt: 'desc' },
        [SortBy.OLDEST]: { createdAt: 'asc' },
        [SortBy.NAME_ASC]: { name: 'asc' },
        [SortBy.NAME_DESC]: { name: 'desc' },
        [SortBy.STATUS_DOWN]: { createdAt: 'desc' },
        [SortBy.STATUS_UP]: { createdAt: 'desc' },
      };

      const [data, totalItems] = await Promise.all([
        this.prisma.monitor.findMany({
          where,
          skip,
          take: limit,
          orderBy: orderByMap[sortBy],
        }),
        this.prisma.monitor.count({ where }),
      ]);

      if (sortBy === SortBy.STATUS_DOWN || sortBy === SortBy.STATUS_UP) {
        const statusPriority: Record<string, number> = {};

        if (sortBy === SortBy.STATUS_DOWN) {
          statusPriority['DOWN'] = 0;
          statusPriority['UP'] = 1;
          statusPriority['PENDING'] = 2;
        } else {
          statusPriority['UP'] = 0;
          statusPriority['DOWN'] = 1;
          statusPriority['PENDING'] = 2;
        }

        (data as any[]).sort((a, b) => {
          const priorityA = statusPriority[a.status] ?? 2;
          const priorityB = statusPriority[b.status] ?? 2;
          return priorityA - priorityB;
        });
      }

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
          totalItems,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error fetching monitors');
    }
  }

  async findOne(id: string, userId?: string) {
    await this.verifyOwnerMonitorByUserId(id, userId);

    try {
      const monitor = await this.prisma.monitor.findUnique({
        where: {
          id,
        },
      });

      if (!monitor) {
        throw new NotFoundException('Monitor not found');
      }

      return monitor;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  async update(id: string, updateUptimeDto: UpdateUptimeDto, userId: string) {
    await this.findOne(id, userId);

    try {
      const { config, maintenanceUntil, maintenanceWindows, ...updateData } = updateUptimeDto;
      const monitorUpdated = await this.prisma.$transaction(async transaction => {
        const updatedMonitor = await transaction.monitor.update({
          where: {
            id,
            userId,
          },
          data: {
            ...updateData,
            ...(config !== undefined
              ? {
                  config: this.secretEnvelopeService.protectConfig(config) as Prisma.InputJsonValue,
                }
              : {}),
            ...(maintenanceUntil !== undefined
              ? { maintenanceUntil: maintenanceUntil ? new Date(maintenanceUntil) : null }
              : {}),
          },
        });

        if (maintenanceWindows !== undefined) {
          await transaction.maintenanceWindow.deleteMany({ where: { monitorId: id } });
          if (maintenanceWindows.length) {
            await transaction.maintenanceWindow.createMany({
              data: maintenanceWindows.map(window => ({ monitorId: id, ...window })),
            });
          }
        }

        if (updateUptimeDto.frequency !== undefined || updateUptimeDto.isActive !== undefined) {
          await this.monitorScheduleOutboxService.enqueue(transaction, id);
        }

        // Si se desactiva el monitor, el processor va a hacer early-return
        // en cada check futuro (isActive check en uptime.processor.ts) y
        // JAMÁS va a correr la transición DOWN->UP que cierra un incidente.
        // Sin esto, un incidente ONGOING queda abierto para siempre.
        if (updateUptimeDto.isActive === false) {
          await transaction.incident.updateMany({
            where: { monitorId: id, status: 'ONGOING' },
            data: { status: 'RESOLVED', endedAt: new Date() },
          });
        }

        return updatedMonitor;
      });

      return {
        message: `Monitor ${monitorUpdated.id} updated successfully`,
        monitor: monitorUpdated,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    try {
      await this.prisma.$transaction(async transaction => {
        await this.monitorScheduleOutboxService.enqueue(transaction, id);
        await transaction.monitor.delete({
          where: {
            id,
          },
        });
      });

      return 'Monitor deleted successfully';
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  // Verificar si el monitor pertenece al usuario (por userId) que lo creo
  async verifyOwnerMonitorByUserId(monitorId: string, userId: string): Promise<void> {
    try {
      const monitor = await this.prisma.monitor.findUnique({
        where: {
          id: monitorId,
        },
        select: {
          userId: true,
        },
      });

      if (!monitor) {
        throw new NotFoundException(`Monitor with id '${monitorId}' not found`);
      }

      if (monitor.userId !== userId) {
        throw new UnauthorizedException('You are not authorized to access this monitor');
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error verifying monitor ownership');
    }
  }

  async clearAllQueueJobs(): Promise<{ message: string; removedCount: number }> {
    return this.monitorScheduleService.clearAll();
  }

  async syncQueueJobs(): Promise<{ orphanedRemoved: number; jobsCreated: number }> {
    return this.monitorScheduleService.synchronizeAll();
  }

  ////
  async getStatsByUserId(userId: string): Promise<GetStatsUserDto> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [totalMonitors, upCount, downCount, pendingCount, monitorsDownLast24h] =
        await Promise.all([
          this.prisma.monitor.count({
            where: { userId, isActive: true },
          }),

          this.prisma.monitor.count({
            where: { userId, status: 'UP', isActive: true },
          }),

          this.prisma.monitor.count({
            where: { userId, status: 'DOWN', isActive: true },
          }),

          this.prisma.monitor.count({
            where: { userId, status: 'PENDING', isActive: true },
          }),

          this.prisma.monitor.findMany({
            where: {
              userId,
              status: 'DOWN',
              isActive: true,
              lastCheck: {
                gte: last24Hours,
              },
            },
            select: {
              id: true,
              name: true,
              url: true,
              lastCheck: true,
            },
          }),
        ]);

      return {
        totalMonitors,
        up: upCount,
        down: downCount,
        pending: pendingCount,
        downLast24hCount: monitorsDownLast24h.length,
        downLast24h: monitorsDownLast24h,
        hasDowntimeLast24h: monitorsDownLast24h.length > 0,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw handlePrismaError(error, 'Error getting monitor stats by user id');
    }
  }

  async getAggregates(
    monitorId: string,
    userId: string,
    granularity: AggregateGranularity = AggregateGranularity.HOURLY,
  ) {
    await this.verifyOwnerMonitorByUserId(monitorId, userId);
    const aggregates = await this.prisma.monitorAggregate.findMany({
      where: {
        monitorId,
        granularity,
        bucketStart: {
          gte: new Date(
            Date.now() - (granularity === AggregateGranularity.DAILY ? 90 : 7) * 86400000,
          ),
        },
      },
      orderBy: { bucketStart: 'asc' },
    });
    return aggregates.map(aggregate => ({
      ...aggregate,
      totalDurationMs: aggregate.totalDurationMs.toString(),
      downtimeMs: aggregate.downtimeMs.toString(),
    }));
  }

  /// Obtener estadísticas de logs avanzadas de un monitor por uptimeId
  async findStatsLogsByUptimeId(
    uptimeId: string,
    userId: string,
  ): Promise<GetStatsLogsByUptimeIdDto> {
    await this.verifyOwnerMonitorByUserId(uptimeId, userId);

    try {
      const monitor = await this.prisma.monitor.findUnique({
        where: { id: uptimeId },
        include: {
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 100,
          },
        },
      });

      if (!monitor) {
        throw new NotFoundException(`Monitor with id '${uptimeId}' not found`);
      }

      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const threeHundredSixtyFiveDaysMs = 365 * 24 * 60 * 60 * 1000;

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - twentyFourHoursMs);
      const sevenDaysAgo = new Date(now.getTime() - sevenDaysMs);
      const thirtyDaysAgo = new Date(now.getTime() - thirtyDaysMs);
      const threeHundredSixtyFiveDaysAgo = new Date(now.getTime() - threeHundredSixtyFiveDaysMs);

      const [stats24Hours, stats7Days, stats30Days, stats365Days] = await Promise.all([
        this.calculateHealthStats(uptimeId, twentyFourHoursAgo, now),
        this.calculateHealthStats(uptimeId, sevenDaysAgo, now),
        this.calculateHealthStats(uptimeId, thirtyDaysAgo, now),
        this.calculateHealthStats(uptimeId, threeHundredSixtyFiveDaysAgo, now),
      ]);

      return {
        monitor: monitor as GetUptimeDto,
        stats: {
          last24Hours: stats24Hours,
          last7Days: stats7Days,
          last30Days: stats30Days,
          last365Days: stats365Days,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error getting stats logs by uptime id');
    }
  }

  private async calculateHealthStats(
    monitorId: string,
    sinceDate: Date,
    toDate: Date = new Date(),
  ): Promise<HealthStatsDto> {
    try {
      const groupedLogs = await this.prisma.pingLog.groupBy({
        by: ['success'],
        where: {
          monitorId,
          timestamp: {
            gte: sinceDate,
            lte: toDate,
          },
        },
        _count: true,
      });

      const successEntry = groupedLogs.find(entry => entry.success === true);
      const failureEntry = groupedLogs.find(entry => entry.success === false);

      const successCount = successEntry?._count ?? 0;
      const failureCount = failureEntry?._count ?? 0;
      const totalCount = successCount + failureCount;

      const healthPercentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

      const downtimeMs = await this.calculateDowntime(monitorId, sinceDate, toDate);
      const periodMs = toDate.getTime() - sinceDate.getTime();
      const uptimeMs = periodMs - downtimeMs;

      return {
        healthPercentage: Math.round(healthPercentage * 100) / 100,
        incidentCount: failureCount,
        totalChecks: totalCount,
        downtimeMs,
        downtimeFormatted: this.formatDuration(downtimeMs),
        uptimeMs,
        uptimeFormatted: this.formatDuration(uptimeMs),
      };
    } catch (error) {
      this.logger.error(
        `Error calculating health stats for monitor ${monitorId}: ${error.message}`,
      );
      return {
        healthPercentage: 0,
        incidentCount: 0,
        totalChecks: 0,
        downtimeMs: 0,
        downtimeFormatted: '0s',
        uptimeMs: 0,
        uptimeFormatted: '0s',
      };
    }
  }

  // Reemplaza el viejo cálculo que traía TODOS los ping_logs de la ventana a
  // memoria y los recorría en JS para sumar gaps de downtime. Ahora que los
  // incidentes están materializados (ver uptime.processor.ts), esto es una
  // sola agregación SQL sobre `incidents`, que tiene órdenes de magnitud
  // menos filas que `ping_logs` para el mismo monitor.
  //
  // Cada incidente aporta el solapamiento de su intervalo [startedAt, endedAt
  // ?? toDate] con la ventana [sinceDate, toDate], recortado en ambos
  // extremos. Un incidente ONGOING se trata como si terminara en `toDate`
  // (que en la práctica es "ahora"). Uno que empezó antes de `sinceDate` y
  // sigue abierto después de `toDate` aporta la ventana completa.
  private async calculateDowntime(
    monitorId: string,
    sinceDate: Date,
    toDate: Date = new Date(),
  ): Promise<number> {
    try {
      const rows = await this.prisma.$queryRaw<{ downtime_ms: bigint }[]>(Prisma.sql`
        SELECT COALESCE(SUM(
          EXTRACT(EPOCH FROM (
            LEAST(COALESCE(ended_at, ${toDate}::timestamptz), ${toDate}::timestamptz)
            - GREATEST(started_at, ${sinceDate}::timestamptz)
          ))
        ) * 1000, 0)::bigint AS downtime_ms
        FROM incidents
        WHERE monitor_id = ${monitorId}
          AND started_at < ${toDate}::timestamptz
          AND COALESCE(ended_at, ${toDate}::timestamptz) > ${sinceDate}::timestamptz
      `);

      return Number(rows[0]?.downtime_ms ?? 0);
    } catch (error) {
      this.logger.error(`Error calculating downtime for monitor ${monitorId}: ${error.message}`);
      return 0;
    }
  }

  private toIncidentDto(incident: Incident, now: Date = new Date()): IncidentDto {
    const endTime = incident.endedAt;
    const durationMs = (endTime ?? now).getTime() - incident.startedAt.getTime();

    return {
      id: incident.id,
      monitorId: incident.monitorId,
      startTime: incident.startedAt,
      endTime,
      durationMs,
      duration: this.formatDuration(durationMs),
      status: incident.status,
      affectedChecks: incident.affectedChecks,
      firstError: incident.firstError ?? undefined,
      lastError: incident.lastError ?? undefined,
    };
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  // Lee directamente la tabla Incident (materializada por uptime.processor.ts
  // en cada transición de estado), paginada. Reemplaza el viejo findMany sin
  // límite sobre TODOS los ping_logs del monitor + reconstrucción en JS.
  async getIncidents(
    monitorId: string,
    userId: string,
    paginationDto?: PaginationIncidentsDto,
  ): Promise<GetIncidentsDto> {
    await this.verifyOwnerMonitorByUserId(monitorId, userId);

    try {
      const { page = 1, limit = 20 } = paginationDto || {};
      const skip = (page - 1) * limit;
      const epoch = new Date(0);
      const now = new Date();

      const [incidents, totalIncidents, ongoingIncidents, totalDowntimeMs] = await Promise.all([
        this.prisma.incident.findMany({
          where: { monitorId },
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.incident.count({ where: { monitorId } }),
        this.prisma.incident.count({ where: { monitorId, status: 'ONGOING' } }),
        this.calculateDowntime(monitorId, epoch, now),
      ]);

      return {
        monitorId,
        incidents: incidents.map(incident => this.toIncidentDto(incident, now)),
        totalIncidents,
        totalDowntime: this.formatDuration(totalDowntimeMs),
        totalDowntimeMs,
        ongoingIncidents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalIncidents / limit),
          totalItems: totalIncidents,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error getting incidents');
    }
  }

  // Antes: 1 findMany(monitors) + un findMany(ping_logs) SIN LÍMITE por cada
  // monitor (N+1), reconstruyendo incidentes en JS y ordenando/paginando en
  // memoria. Ahora: la lista paginada sale de un solo query sobre `incidents`
  // (o un raw query cuando se ordena por duración, ver más abajo), y el
  // resumen por monitor sale de un GROUP BY. Ninguno de los dos escala con la
  // cantidad de ping_logs históricos.
  async getIncidentsByUserId(
    userId: string,
    paginationDto?: PaginationIncidentsDto,
  ): Promise<GetIncidentsByUserIdDto> {
    try {
      const { page = 1, limit = 20, search, sortBy = IncidentSortBy.RECENT } = paginationDto || {};
      const skip = (page - 1) * limit;
      const now = new Date();

      const [byMonitor, totalIncidents, ongoingIncidents, incidents] = await Promise.all([
        this.getMonitorIncidentSummaries(userId, search, now),
        this.countIncidentsByUserId(userId, search),
        this.prisma.incident.count({ where: { userId, status: 'ONGOING' } }),
        this.findIncidentsPageByUserId(userId, search, sortBy, skip, limit, now),
      ]);

      byMonitor.sort((a, b) => b.incidentCount - a.incidentCount);
      const totalDowntimeMs = byMonitor.reduce((sum, m) => sum + m.totalDowntimeMs, 0);
      const monitorsDown = byMonitor.filter(m => m.monitorStatus === 'DOWN').length;

      return {
        userId,
        incidents,
        byMonitor,
        totalIncidents,
        totalDowntime: this.formatDuration(totalDowntimeMs),
        totalDowntimeMs,
        ongoingIncidents,
        totalMonitors: byMonitor.length,
        monitorsDown,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalIncidents / limit),
          totalItems: totalIncidents,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw handlePrismaError(error, 'Error getting incidents by user id');
    }
  }

  private async countIncidentsByUserId(userId: string, search?: string): Promise<number> {
    if (!search) {
      return this.prisma.incident.count({ where: { userId } });
    }

    return this.prisma.incident.count({
      where: {
        userId,
        monitor: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { url: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    });
  }

  // GROUP BY sobre monitores activos del usuario (LEFT JOIN a incidents para
  // que un monitor sin incidentes todavía aparezca con count 0), igual que el
  // `monitorWhere: { userId, isActive: true }` de la implementación vieja.
  private async getMonitorIncidentSummaries(
    userId: string,
    search: string | undefined,
    now: Date,
  ): Promise<MonitorIncidentSummaryDto[]> {
    const searchClause = search
      ? Prisma.sql`AND (m.name ILIKE ${'%' + search + '%'} OR m.url ILIKE ${'%' + search + '%'})`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      Array<{
        monitorId: string;
        monitorName: string;
        monitorUrl: string;
        monitorStatus: string;
        incidentCount: number;
        hasOngoingIncident: boolean;
        totalDowntimeMs: bigint;
      }>
    >(Prisma.sql`
      SELECT
        m.id AS "monitorId",
        m.name AS "monitorName",
        m.url AS "monitorUrl",
        m.status AS "monitorStatus",
        COUNT(i.id)::int AS "incidentCount",
        COALESCE(BOOL_OR(i.status = 'ONGOING'), false) AS "hasOngoingIncident",
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (COALESCE(i.ended_at, ${now}::timestamptz) - i.started_at))
        ) * 1000, 0)::bigint AS "totalDowntimeMs"
      FROM monitors m
      LEFT JOIN incidents i ON i.monitor_id = m.id
      WHERE m.user_id = ${userId} AND m.is_active = true
      ${searchClause}
      GROUP BY m.id, m.name, m.url, m.status
    `);

    return rows.map(row => ({
      monitorId: row.monitorId,
      monitorName: row.monitorName,
      monitorUrl: row.monitorUrl,
      monitorStatus: row.monitorStatus as any,
      incidentCount: row.incidentCount,
      hasOngoingIncident: row.hasOngoingIncident,
      totalDowntime: this.formatDuration(Number(row.totalDowntimeMs)),
      totalDowntimeMs: Number(row.totalDowntimeMs),
    }));
  }

  private async findIncidentsPageByUserId(
    userId: string,
    search: string | undefined,
    sortBy: IncidentSortBy,
    skip: number,
    limit: number,
    now: Date,
  ): Promise<IncidentWithMonitorDto[]> {
    // "duration" no es una columna: es endedAt ?? now() - startedAt. Prisma
    // no puede ordenar por un cálculo, así que estos dos casos van por SQL
    // crudo (con su propio LIMIT/OFFSET — sigue sin traer todo a memoria).
    if (sortBy === IncidentSortBy.DURATION_LONGEST || sortBy === IncidentSortBy.DURATION_SHORTEST) {
      return this.findIncidentsPageByUserIdSortedByDuration(
        userId,
        search,
        sortBy === IncidentSortBy.DURATION_LONGEST ? 'DESC' : 'ASC',
        skip,
        limit,
        now,
      );
    }

    const where: Prisma.IncidentWhereInput = { userId };
    if (search) {
      where.monitor = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const orderByMap: Record<IncidentSortBy, Prisma.IncidentOrderByWithRelationInput> = {
      [IncidentSortBy.RECENT]: { startedAt: 'desc' },
      [IncidentSortBy.OLDEST]: { startedAt: 'asc' },
      [IncidentSortBy.NAME_ASC]: { monitor: { name: 'asc' } },
      [IncidentSortBy.NAME_DESC]: { monitor: { name: 'desc' } },
      [IncidentSortBy.DURATION_LONGEST]: { startedAt: 'desc' },
      [IncidentSortBy.DURATION_SHORTEST]: { startedAt: 'desc' },
    };

    const incidents = await this.prisma.incident.findMany({
      where,
      orderBy: orderByMap[sortBy] ?? { startedAt: 'desc' },
      skip,
      take: limit,
      include: { monitor: { select: { name: true, url: true, status: true } } },
    });

    return incidents.map(incident => ({
      ...this.toIncidentDto(incident, now),
      monitorName: incident.monitor.name,
      monitorUrl: incident.monitor.url,
      monitorStatus: incident.monitor.status as any,
    }));
  }

  private async findIncidentsPageByUserIdSortedByDuration(
    userId: string,
    search: string | undefined,
    direction: 'DESC' | 'ASC',
    skip: number,
    limit: number,
    now: Date,
  ): Promise<IncidentWithMonitorDto[]> {
    const searchClause = search
      ? Prisma.sql`AND (m.name ILIKE ${'%' + search + '%'} OR m.url ILIKE ${'%' + search + '%'})`
      : Prisma.empty;
    const orderClause = direction === 'DESC' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        monitorId: string;
        status: string;
        startedAt: Date;
        endedAt: Date | null;
        affectedChecks: number;
        firstError: string | null;
        lastError: string | null;
        monitorName: string;
        monitorUrl: string;
        monitorStatus: string;
        durationMs: bigint;
      }>
    >(Prisma.sql`
      SELECT
        i.id, i.monitor_id AS "monitorId", i.status,
        i.started_at AS "startedAt", i.ended_at AS "endedAt",
        i.affected_checks AS "affectedChecks",
        i.first_error AS "firstError", i.last_error AS "lastError",
        m.name AS "monitorName", m.url AS "monitorUrl", m.status AS "monitorStatus",
        (EXTRACT(EPOCH FROM (COALESCE(i.ended_at, ${now}::timestamptz) - i.started_at)) * 1000)::bigint AS "durationMs"
      FROM incidents i
      JOIN monitors m ON m.id = i.monitor_id
      WHERE i.user_id = ${userId}
      ${searchClause}
      ORDER BY "durationMs" ${orderClause}
      LIMIT ${limit} OFFSET ${skip}
    `);

    return rows.map(row => ({
      id: row.id,
      monitorId: row.monitorId,
      monitorName: row.monitorName,
      monitorUrl: row.monitorUrl,
      monitorStatus: row.monitorStatus as any,
      startTime: row.startedAt,
      endTime: row.endedAt,
      durationMs: Number(row.durationMs),
      duration: this.formatDuration(Number(row.durationMs)),
      status: row.status as any,
      affectedChecks: row.affectedChecks,
      firstError: row.firstError ?? undefined,
      lastError: row.lastError ?? undefined,
    }));
  }
}
