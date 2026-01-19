import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';
import { CreatePingLogDto, UpdatePingLogDto, PaginationPingLogDto, PaginatedResponseDto } from './dto';

@Injectable()
export class PingLogService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}
  
  async create(createPingLogDto: CreatePingLogDto) {
    try {
       const { monitorId, statusCode, durationMs, success, error } = createPingLogDto;

       await this.prisma.pingLog.create({
        data:{
          monitorId,
          statusCode,
          durationMs,
          success,
          error,
          timestamp: new Date()
        }
       })

      return 'PingLog created successfully';
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
  
  async findAll() {
    try {
      const getAllPingLogs = this.prisma.pingLog.findMany();
      
      if (!getAllPingLogs) {
        throw new NotFoundException('No ping logs found');
      }

      return getAllPingLogs;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
  
  async findOne(id: string) {
    try {
      const pingLog = await this.prisma.pingLog.findUnique({
        where: {
          id,
        },
      });
      
      if (!pingLog) {
        throw new NotFoundException(`PingLog with id ${id} not found`);
      }
      
      return pingLog;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
  
  async update(id: string, updatePingLogDto: UpdatePingLogDto) {
    await this.findOne(id);
    
    try {
      const { monitorId, statusCode, durationMs, success, error } = updatePingLogDto;

      const timestamp = new Date();

      await this.prisma.pingLog.update({
        where: {
          id
        },
    data: {
      monitorId,
      statusCode,
      durationMs,
      success,
      error,
      timestamp
    }        
      })

      return "PingLog updated successfully";
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
  
  async remove(id: string): Promise<string> {
    await this.findOne(id);
    
    try {
      await this.prisma.pingLog.delete({
        where: {
          id
        }
      })
      
      return "PingLog deleted successfully";
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
  
  // Obtener ping logs de monitors creados por un usuario
  async findAllPingLogsByUser(userId: string, paginationDto: PaginationPingLogDto): Promise<PaginatedResponseDto<any>> {
    try {
        const { page = 1, limit = 10, monitorId } = paginationDto;
        const skip = (page - 1) * limit;

        const where = {
            monitor: {
                userId: userId,
            },
            ...(monitorId && { monitorId }),
        };

        const [data, totalItems] = await Promise.all([
            this.prisma.pingLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
            }),
            this.prisma.pingLog.count({ where }),
        ]);

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
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw handlePrismaError( error, 'PingLog' );
    }
  }
}
