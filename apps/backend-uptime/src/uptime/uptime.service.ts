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
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { Queue } from 'bullmq';

@Injectable()
export class UptimeService {
    private readonly logger = new Logger(UptimeService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('uptime-monitor') private readonly monitorQueue: Queue,
    ) {}

  async create(createUptimeDto: CreateUptimeDto) {
    try {
      const { name, url, frequency, userId } = createUptimeDto;

      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException(`User with id '${userId}' does not exist. Please create a user first.`);
      }

      const now = new Date();
      const nextCheck = new Date(now.getTime() + frequency * 1000);

      const createUptime = await this.prisma.monitor.create({
        data: {
          userId,
          name,
          url,
          frequency,
          nextCheck,
          isActive: true,
        },
      });

      // Crear job recurrente que se ejecuta cada 1 minuto
      // Este job buscará todos los monitors que necesiten check
      await this.ensureRecurringJobExists();

      this.logger.log(`Monitor created: ${name} (next check at ${nextCheck})`);

      return createUptime;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }
  
  async findAll() {
    try {
      const allMonitors = await this.prisma.monitor.findMany();

      if (!allMonitors) {
        throw new NotFoundException('No monitors found');
      }
      
      return allMonitors;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }
  
  async findOne(id: string, userId?: string) {
    await this.verifyOwnerMonitorByUserId(userId);

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
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
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
       })

   return {
    message: `Monitor ${monitorUpdated.id} updated successfully`,
    monitor: monitorUpdated,
   }
   
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    } 
  }
  
  async remove(id: string, userId: string) {
   await this.findOne(id, userId);
   
    try {
     await this.prisma.monitor.delete({
       where: {
         id,
       },
     });

     return "Monitor deleted successfully";
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  //////// Verificar si el monitor pertenece al usuario (por userId) que lo creo
  async verifyOwnerMonitorByUserId(userId: string ) {
    try {
       const monitorSearched = await this.prisma.monitor.findFirst({
        where: {
          userId,
        },
        select: {
          userId: true,
        },
       })

       if (!monitorSearched) {
        throw new UnauthorizedException('You are not authorized to access this monitor');
       }

       return;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError(error, 'Error creating uptime');
    }
  }

  /**
   * Asegura que exista un job recurrente que escanee los monitors cada minuto
   * Este job se crea solo una vez (usando jobId único)
   */
  private async ensureRecurringJobExists() {
    const jobId = 'global-monitor-scan';

    // Verificar si el job ya existe
    const existingJob = await this.monitorQueue.getJob(jobId);

    if (!existingJob) {
      await this.monitorQueue.add(
        'scan-monitors',
        { timestamp: Date.now() },
        {
          jobId,
          repeat: {
            every: 60000, // Cada 60 segundos (1 minuto)
          },
        },
      );
      this.logger.log('Recurring monitor scan job created (runs every 1 minute)');
    }
  }
}
