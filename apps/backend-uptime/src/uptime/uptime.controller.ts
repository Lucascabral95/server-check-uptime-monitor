import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UptimeService } from './uptime.service';
import { CreateUptimeDto, UpdateUptimeDto, PaginationUptimeDto, GetUptimeDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RequestUserDto } from 'src/user/dto';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Uptime')
@ApiBearerAuth('jwt-auth')
@Controller('uptime')
export class UptimeController {
  constructor(
    private readonly uptimeService: UptimeService,
    private readonly httpPoolService: HttpPoolService,
    private readonly pingLogBufferService: PingLogBufferService,
  ) {}
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear monitor de uptime' })
  @ApiResponse({ status: 201, type: GetUptimeDto })
  create(@Body() createUptimeDto: CreateUptimeDto) {
    return this.uptimeService.create(createUptimeDto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Listar monitores con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: Role })
  findAll(@Query() paginationDto: PaginationUptimeDto) {
    return this.uptimeService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas internas del sistema' })
    getStats() {
        return {
            httpPool: this.httpPoolService.getStats(),
            buffer: this.pingLogBufferService.getStats(),
            pools: this.httpPoolService.getPoolInfo(),
            bufferUtilization: this.pingLogBufferService.getBufferUtilization(),
        };
    }

    @Get('flush')
    @ApiOperation({ summary: 'Forzar flush del buffer de logs' })
    async forceFlush() {
        await this.pingLogBufferService.forceFlush();
        return { message: 'Buffer flushed successfully' };
    }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener monitor por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetUptimeDto })
  findOne(@Param('id') id: string, @Request() req: RequestUserDto) {
     return this.uptimeService.findOne(id, req.user.dbUserId);
  }
  
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar monitor' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetUptimeDto })
  update(@Param('id') id: string, @Body() updateUptimeDto: UpdateUptimeDto, @Request() req: RequestUserDto) {
    return this.uptimeService.update(id, updateUptimeDto, req.user.dbUserId);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar monitor' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.uptimeService.remove(id, req.user.dbUserId);
  }
}

