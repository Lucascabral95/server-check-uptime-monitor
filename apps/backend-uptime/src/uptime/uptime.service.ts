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
import { PaginationUptimeDto, PaginatedResponseDto, SortBy } from './dto/pagination-uptime.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { Queue } from 'bullmq';
import { GetStatsUserDto } from './dto';

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
}
