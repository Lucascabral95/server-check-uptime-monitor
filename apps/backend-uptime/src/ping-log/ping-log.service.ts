import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePingLogDto } from './dto/create-ping-log.dto';
import { UpdatePingLogDto } from './dto/update-ping-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/errors';

@Injectable()
export class PingLogService {

  constructor(private readonly prisma: PrismaService) {}
  
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

  remove(id: string) {
    return `Fixture No available for remove.`;
  }
}
