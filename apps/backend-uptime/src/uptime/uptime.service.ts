import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { CreateUptimeDto } from './dto/create-uptime.dto';
import { UpdateUptimeDto } from './dto/update-uptime.dto';
import { PaginationUptimeDto, PaginatedResponseDto, SortBy, PaginationIncidentsDto, IncidentSortBy } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { Queue } from 'bullmq';
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
        @InjectQueue('uptime-monitor') private readonly monitorQueue: Queue,
    ) {}

    async create(createUptimeDto: CreateUptimeDto, userId: string) {
        try {
            const { name, url, frequency } = createUptimeDto;

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

            const monitor = await this.prisma.monitor.create({
                data: {
                    userId,
                    name,
                    url,
                    frequency,
                    nextCheck,
                    isActive: true,
                },
            });

            // ✅ NUEVO: Crear job INDIVIDUAL recurrente para este monitor
            await this.createMonitorJob(monitor.id, monitor.url, monitor.frequency);

            this.logger.log(`Monitor created: ${name} (next check at ${nextCheck})`);

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

    async findAll(paginationDto: PaginationUptimeDto = {}): Promise<PaginatedResponseDto<any>> {
        try {
            const { page = 1, limit = 10, userId, status, sortBy = SortBy.RECENT, search } = paginationDto;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (userId) {
                where.userId = userId;
            }

            if (status) {
                where.status = status;
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
            const monitorUpdated = await this.prisma.monitor.update({
                where: {
                    id,
                    userId,
                },
                data: {
                    ...updateUptimeDto,
                },
            });

            if (updateUptimeDto.frequency || updateUptimeDto.isActive !== undefined) {
                await this.updateMonitorJob(
                    id,
                    monitorUpdated.url,
                    monitorUpdated.frequency,
                    monitorUpdated.isActive ?? true,
                );
            }

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
            await this.removeMonitorJob(id);

            await this.prisma.monitor.delete({
                where: {
                    id,
                },
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
                id: monitorId 
            },
            select: {
                userId: true,
            },
        });

        if (!monitor) {
            throw new NotFoundException(`Monitor with id '${monitorId}' not found`);
        }

        if (monitor.userId !== userId) {
            throw new UnauthorizedException(
                'You are not authorized to access this monitor',
            );
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

    // Crea un job recurrente individual para un monitor específico.
    private async createMonitorJob(monitorId: string, _url: string, frequency: number) {
        const jobId = `monitor:${monitorId}`;

        await this.monitorQueue.add(
            'check-monitor',
            {
                monitorId,
            },
            {
                jobId, // ID único para evitar duplicados
                repeat: {
                    every: frequency * 1000, // Frecuencia del monitor en ms
                },
            },
        );

        this.logger.log(
            `Monitor job created: ${monitorId} (frequency: ${frequency}s)`,
        );
    }

    // Actualiza el job recurrente de un monitor cuando cambia frecuencia o estado.
    private async updateMonitorJob(
        monitorId: string,
        _url: string,
        frequency: number,
        isActive: boolean,
    ) {
        const jobId = `monitor:${monitorId}`;

        // Eliminar el job anterior
        await this.monitorQueue.remove(jobId);

        // Si el monitor sigue activo, crear nuevo job con la frecuencia actualizada
        if (isActive) {
            await this.createMonitorJob(monitorId, '', frequency);
        } else {
            this.logger.log(`Monitor job removed: ${monitorId} (monitor inactive)`);
        }
    }

    // Elimina el job recurrente de un monitor.
    private async removeMonitorJob(monitorId: string): Promise<void> {
        const jobId = `monitor:${monitorId}`;

        try {
            await this.monitorQueue.remove(jobId);
            this.logger.log(`Monitor job removed: ${monitorId}`);
        } catch (error) {
            this.logger.warn(`Monitor job not found for removal: ${monitorId}`);
        }
    }

    /////  
    async getStatsByUserId(userId: string): Promise<GetStatsUserDto> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [
        totalMonitors,
        upCount,
        downCount,
        pendingCount,
        monitorsDownLast24h,
      ] = await Promise.all([
        this.prisma.monitor.count({
          where: { userId },
        }),

        this.prisma.monitor.count({
          where: { userId, status: 'UP' },
        }),

        this.prisma.monitor.count({
          where: { userId, status: 'DOWN' },
        }),

        this.prisma.monitor.count({
          where: { userId, status: 'PENDING' },
        }),

        this.prisma.monitor.findMany({
          where: {
            userId,
            status: 'DOWN',
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
      throw handlePrismaError(
        error,
        'Error getting stats logs by uptime id',
      );
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

      const successEntry = groupedLogs.find((entry) => entry.success === true);
      const failureEntry = groupedLogs.find((entry) => entry.success === false);

      const successCount = successEntry?._count ?? 0;
      const failureCount = failureEntry?._count ?? 0;
      const totalCount = successCount + failureCount;

      const healthPercentage =
        totalCount > 0 ? (successCount / totalCount) * 100 : 0;

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

  private async calculateDowntime(
    monitorId: string,
    sinceDate: Date,
    toDate: Date = new Date(),
  ): Promise<number> {
    try {
      const logs = await this.prisma.pingLog.findMany({
        where: {
          monitorId,
          timestamp: {
            gte: sinceDate,
            lte: toDate,
          },
        },
        orderBy: { timestamp: 'asc' },
        select: {
          timestamp: true,
          success: true,
        },
      });

      if (logs.length === 0) {
        return 0;
      }

      let downtimeMs = 0;
      let inDowntime = false;
      let downtimeStart: Date | null = null;

      for (const log of logs) {
        if (!log.success && !inDowntime) {
          inDowntime = true;
          downtimeStart = log.timestamp;
        } else if (log.success && inDowntime && downtimeStart) {
          downtimeMs += log.timestamp.getTime() - downtimeStart.getTime();
          inDowntime = false;
          downtimeStart = null;
        }
      }

      if (inDowntime && downtimeStart) {
        downtimeMs += toDate.getTime() - downtimeStart.getTime();
      }

      return downtimeMs;
    } catch (error) {
      this.logger.error(
        `Error calculating downtime for monitor ${monitorId}: ${error.message}`,
      );
      return 0;
    }
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

  // Obtiene la lista de incidentes (períodos de caída) de un monitor
  // Agrupa logs fallidos consecutivos en incidentes individuales
  async getIncidents(monitorId: string, userId: string): Promise<GetIncidentsDto> {
    await this.verifyOwnerMonitorByUserId(monitorId, userId);

    try {
      const logs = await this.prisma.pingLog.findMany({
        where: {
          monitorId,
        },
        orderBy: {
          timestamp: 'asc',
        },
        select: {
          id: true,
          timestamp: true,
          success: true,
          error: true,
          statusCode: true,
        },
      });

      if (logs.length === 0) {
        return {
          monitorId,
          incidents: [],
          totalIncidents: 0,
          totalDowntime: '0s',
          totalDowntimeMs: 0,
          ongoingIncidents: 0,
        };
      }

      const monitor = await this.prisma.monitor.findUnique({
        where: { id: monitorId },
        select: { status: true },
      });

      const isCurrentlyDown = monitor?.status === 'DOWN';

      const incidents: IncidentDto[] = [];
      let currentIncident: Partial<IncidentDto> | null = null;
      let totalDowntimeMs = 0;

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];

        if (!log.success) {
          if (!currentIncident) {
            currentIncident = {
              id: `incident-${log.timestamp.getTime()}-${monitorId}`,
              monitorId,
              startTime: log.timestamp,
              endTime: null,
              durationMs: 0,
              duration: '',
              status: 'ONGOING',
              affectedChecks: 1,
              firstError: log.error || `HTTP ${log.statusCode}`,
              lastError: log.error || `HTTP ${log.statusCode}`,
            };
          } else {
            currentIncident.affectedChecks!++;
            currentIncident.lastError = log.error || `HTTP ${log.statusCode}`;
          }
        } else {
          if (currentIncident) {
            const endTime = log.timestamp;
            const durationMs = endTime.getTime() - currentIncident.startTime!.getTime();

            incidents.push({
              id: currentIncident.id!,
              monitorId: currentIncident.monitorId!,
              startTime: currentIncident.startTime!,
              endTime,
              durationMs,
              duration: this.formatDuration(durationMs),
              status: 'RESOLVED',
              affectedChecks: currentIncident.affectedChecks!,
              firstError: currentIncident.firstError,
              lastError: currentIncident.lastError,
            });

            totalDowntimeMs += durationMs;
            currentIncident = null;
          }
        }
      }

      if (currentIncident) {
        const endTime = isCurrentlyDown ? null : new Date();
        const durationMs = endTime
          ? endTime.getTime() - currentIncident.startTime!.getTime()
          : Date.now() - currentIncident.startTime!.getTime();

        incidents.push({
          id: currentIncident.id!,
          monitorId: currentIncident.monitorId!,
          startTime: currentIncident.startTime!,
          endTime,
          durationMs,
          duration: this.formatDuration(durationMs),
          status: isCurrentlyDown ? 'ONGOING' : 'RESOLVED',
          affectedChecks: currentIncident.affectedChecks!,
          firstError: currentIncident.firstError,
          lastError: currentIncident.lastError,
        });

        totalDowntimeMs += durationMs;
      }

      incidents.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      const ongoingCount = incidents.filter((i) => i.status === 'ONGOING').length;

      return {
        monitorId,
        incidents,
        totalIncidents: incidents.length,
        totalDowntime: this.formatDuration(totalDowntimeMs),
        totalDowntimeMs,
        ongoingIncidents: ongoingCount,
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

  // Obtiene todos los incidentes de todos los monitores del usuario
  // Retorna incidentes agrupados con información del monitor
  async getIncidentsByUserId(userId: string, paginationDto?: PaginationIncidentsDto): Promise<GetIncidentsByUserIdDto> {
    try {
      const { search, sortBy = IncidentSortBy.RECENT } = paginationDto || {};

      // Build the where clause for search
      const monitorWhere: any = { userId };

      if (search) {
        monitorWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ];
      }

      const monitors = await this.prisma.monitor.findMany({
        where: monitorWhere,
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
        },
      });

      if (monitors.length === 0) {
        return {
          userId,
          incidents: [],
          byMonitor: [],
          totalIncidents: 0,
          totalDowntime: '0s',
          totalDowntimeMs: 0,
          ongoingIncidents: 0,
          totalMonitors: 0,
          monitorsDown: 0,
        };
      }

      const allIncidents: IncidentWithMonitorDto[] = [];
      const byMonitor: MonitorIncidentSummaryDto[] = [];
      let totalDowntimeMs = 0;
      let monitorsDown = 0;

      for (const monitor of monitors) {
        const logs = await this.prisma.pingLog.findMany({
          where: { monitorId: monitor.id },
          orderBy: { timestamp: 'asc' },
          select: {
            id: true,
            timestamp: true,
            success: true,
            error: true,
            statusCode: true,
          },
        });

        const isCurrentlyDown = monitor.status === 'DOWN';
        if (isCurrentlyDown) monitorsDown++;

        const monitorIncidents: IncidentWithMonitorDto[] = [];
        let currentIncident: Partial<IncidentWithMonitorDto> | null = null;
        let monitorDowntimeMs = 0;

        for (const log of logs) {
          if (!log.success) {
            if (!currentIncident) {
              currentIncident = {
                id: `incident-${log.timestamp.getTime()}-${monitor.id}`,
                monitorId: monitor.id,
                monitorName: monitor.name,
                monitorUrl: monitor.url,
                monitorStatus: monitor.status,
                startTime: log.timestamp,
                endTime: null,
                durationMs: 0,
                duration: '',
                status: 'ONGOING',
                affectedChecks: 1,
                firstError: log.error || `HTTP ${log.statusCode}`,
                lastError: log.error || `HTTP ${log.statusCode}`,
              };
            } else {
              currentIncident.affectedChecks!++;
              currentIncident.lastError = log.error || `HTTP ${log.statusCode}`;
            }
          } else {
            if (currentIncident) {
              const endTime = log.timestamp;
              const durationMs = endTime.getTime() - currentIncident.startTime!.getTime();

              monitorIncidents.push({
                id: currentIncident.id!,
                monitorId: currentIncident.monitorId!,
                monitorName: currentIncident.monitorName!,
                monitorUrl: currentIncident.monitorUrl!,
                monitorStatus: currentIncident.monitorStatus!,
                startTime: currentIncident.startTime!,
                endTime,
                durationMs,
                duration: this.formatDuration(durationMs),
                status: 'RESOLVED',
                affectedChecks: currentIncident.affectedChecks!,
                firstError: currentIncident.firstError,
                lastError: currentIncident.lastError,
              });

              monitorDowntimeMs += durationMs;
              currentIncident = null;
            }
          }
        }

        if (currentIncident) {
          const endTime = isCurrentlyDown ? null : new Date();
          const durationMs = endTime
            ? endTime.getTime() - currentIncident.startTime!.getTime()
            : Date.now() - currentIncident.startTime!.getTime();

          monitorIncidents.push({
            id: currentIncident.id!,
            monitorId: currentIncident.monitorId!,
            monitorName: currentIncident.monitorName!,
            monitorUrl: currentIncident.monitorUrl!,
            monitorStatus: currentIncident.monitorStatus!,
            startTime: currentIncident.startTime!,
            endTime,
            durationMs,
            duration: this.formatDuration(durationMs),
            status: isCurrentlyDown ? 'ONGOING' : 'RESOLVED',
            affectedChecks: currentIncident.affectedChecks!,
            firstError: currentIncident.firstError,
            lastError: currentIncident.lastError,
          });

          monitorDowntimeMs += durationMs;
        }

        allIncidents.push(...monitorIncidents);
        totalDowntimeMs += monitorDowntimeMs;

        const hasOngoingIncident = monitorIncidents.some((i) => i.status === 'ONGOING');
        byMonitor.push({
          monitorId: monitor.id,
          monitorName: monitor.name,
          monitorUrl: monitor.url,
          monitorStatus: monitor.status,
          incidentCount: monitorIncidents.length,
          hasOngoingIncident,
          totalDowntime: this.formatDuration(monitorDowntimeMs),
          totalDowntimeMs: monitorDowntimeMs,
        });
      }

      allIncidents.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      byMonitor.sort((a, b) => b.incidentCount - a.incidentCount);

      // Apply sorting based on sortBy parameter
      if (sortBy) {
        switch (sortBy) {
          case IncidentSortBy.RECENT:
            allIncidents.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
            break;
          case IncidentSortBy.OLDEST:
            allIncidents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
            break;
          case IncidentSortBy.NAME_ASC:
            allIncidents.sort((a, b) => a.monitorName.localeCompare(b.monitorName));
            break;
          case IncidentSortBy.NAME_DESC:
            allIncidents.sort((a, b) => b.monitorName.localeCompare(a.monitorName));
            break;
          case IncidentSortBy.DURATION_LONGEST:
            allIncidents.sort((a, b) => b.durationMs - a.durationMs);
            break;
          case IncidentSortBy.DURATION_SHORTEST:
            allIncidents.sort((a, b) => a.durationMs - b.durationMs);
            break;
        }
      }

      const ongoingCount = allIncidents.filter((i) => i.status === 'ONGOING').length;

      return {
        userId,
        incidents: allIncidents,
        byMonitor,
        totalIncidents: allIncidents.length,
        totalDowntime: this.formatDuration(totalDowntimeMs),
        totalDowntimeMs,
        ongoingIncidents: ongoingCount,
        totalMonitors: monitors.length,
        monitorsDown,
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
}
