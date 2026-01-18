import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UptimeService } from './uptime.service';
import { CreateUptimeDto, UpdateUptimeDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUserDto } from 'src/user/dto';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';

@Controller('uptime')
export class UptimeController {
  constructor(
    private readonly uptimeService: UptimeService,
    private readonly httpPoolService: HttpPoolService,
    private readonly pingLogBufferService: PingLogBufferService,
  ) {}
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createUptimeDto: CreateUptimeDto) {
    return this.uptimeService.create(createUptimeDto);
  }
  
  @Get()
  findAll() {
    return this.uptimeService.findAll();
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string, @Request() req: RequestUserDto) {
     return this.uptimeService.findOne(id, req.user.dbUserId);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUptimeDto: UpdateUptimeDto, @Request() req: RequestUserDto) {
    return this.uptimeService.update(id, updateUptimeDto, req.user.dbUserId);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.uptimeService.remove(id, req.user.dbUserId);
  }

  @Get('stats')
    getStats() {
        return {
            httpPool: this.httpPoolService.getStats(),
            buffer: this.pingLogBufferService.getStats(),
            pools: this.httpPoolService.getPoolInfo(),
            bufferUtilization: this.pingLogBufferService.getBufferUtilization(),
        };
    }

    @Get('flush')
    async forceFlush() {
        await this.pingLogBufferService.forceFlush();
        return { message: 'Buffer flushed successfully' };
    }
}

