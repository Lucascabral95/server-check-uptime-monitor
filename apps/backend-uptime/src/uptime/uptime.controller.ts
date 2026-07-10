import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UptimeService } from './uptime.service';
import {
  CreateUptimeDto,
  UpdateUptimeDto,
  PaginationUptimeDto,
  GetUptimeDto,
  SortBy,
  GetStatsUserDto,
  GetStatsLogsByUptimeIdDto,
  GetIncidentsDto,
  GetIncidentsByUserIdDto,
  PaginationIncidentsDto,
  IncidentSortBy,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { MonitorOwnerGuard } from 'src/auth/guards/monitor-owner.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role, Status } from '@prisma/client';
import { AggregateGranularity } from '@prisma/client';
import { RequestUserDto } from 'src/user/dto';
import { HttpPoolService } from './services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('Uptime')
@ApiBearerAuth('jwt-auth')
@Controller('uptime')
export class UptimeController {
  constructor(
    private readonly uptimeService: UptimeService,
    private readonly httpPoolService: HttpPoolService,
    private readonly pingLogBufferService: PingLogBufferService,
  ) {}

  @Throttle({ short: {} })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear monitor de uptime' })
  @ApiResponse({ status: 201, type: GetUptimeDto })
  create(@Body() createUptimeDto: CreateUptimeDto, @Request() req: RequestUserDto) {
    return this.uptimeService.create(createUptimeDto, req.user.dbUserId);
  }

  @Throttle({ medium: {} })
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar monitores con paginación (solo los del usuario autenticado, salvo ADMIN)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Solo ADMIN puede filtrar por otro usuario',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Solo ADMIN puede filtrar por email',
  })
  @ApiQuery({ name: 'status', required: false, enum: Status })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por nombre o URL',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir monitores inactivos (isActive: false). Por defecto false.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: SortBy,
    description:
      'Ordenar resultados: recent (más recientes), oldest (más antiguos), name_asc (A-Z), name_desc (Z-A), status_down (fallidos primero), status_up (up primero)',
    example: SortBy.RECENT,
  })
  findAll(@Query() paginationDto: PaginationUptimeDto, @Request() req: RequestUserDto) {
    return this.uptimeService.findAll(paginationDto, {
      dbUserId: req.user.dbUserId,
      role: req.user.role,
    });
  }

  @SkipThrottle()
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas internas del sistema (solo ADMIN)' })
  getStats() {
    return {
      httpPool: this.httpPoolService.getStats(),
      buffer: this.pingLogBufferService.getStats(),
      pools: this.httpPoolService.getPoolInfo(),
      bufferUtilization: this.pingLogBufferService.getBufferUtilization(),
    };
  }

  @Throttle({ medium: {} })
  @Get('stats/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas de mis links activos' })
  getStatsUser(@Request() req: RequestUserDto): Promise<GetStatsUserDto> {
    return this.uptimeService.getStatsByUserId(req.user.dbUserId);
  }

  @Throttle({ medium: {} })
  @Get('stats/aggregates/:id')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  getAggregates(@Param('id') id: string, @Query('granularity') granularity: AggregateGranularity = AggregateGranularity.HOURLY, @Request() req: RequestUserDto) {
    return this.uptimeService.getAggregates(id, req.user.dbUserId, granularity);
  }

  @Throttle({ medium: {} })
  @Post('flush')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Forzar flush del buffer de logs (solo ADMIN)' })
  async forceFlush() {
    await this.pingLogBufferService.forceFlush();
    return { message: 'Buffer flushed successfully' };
  }

  @Throttle({ short: {} })
  @Post('queue/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Limpiar todos los jobs de la cola (útil después de db:reset o db:seed) (solo ADMIN)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        removedCount: { type: 'number' },
      },
    },
  })
  async clearQueueJobs() {
    return this.uptimeService.clearAllQueueJobs();
  }

  @Throttle({ short: {} })
  @Post('queue/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Sincronizar jobs de la cola con monitores en BD - elimina huérfanos y crea faltantes (solo ADMIN)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        orphanedRemoved: { type: 'number' },
        jobsCreated: { type: 'number' },
      },
    },
  })
  async syncQueueJobs() {
    return this.uptimeService.syncQueueJobs();
  }

  @Throttle({ medium: {} })
  @Get(':id')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  @ApiOperation({ summary: 'Obtener monitor por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetUptimeDto })
  findOne(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.uptimeService.findOne(id, req.user.dbUserId);
  }

  @Throttle({ medium: {} })
  @Get('logs/:uptimeId')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  @ApiOperation({ summary: 'Obtener logs de un monitor por ID' })
  @ApiParam({ name: 'uptimeId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetStatsLogsByUptimeIdDto })
  findStatsLogsByUptimeId(
    @Param('uptimeId') uptimeId: string,
    @Request() req: RequestUserDto,
  ): Promise<GetStatsLogsByUptimeIdDto> {
    return this.uptimeService.findStatsLogsByUptimeId(uptimeId, req.user.dbUserId);
  }

  @Throttle({ medium: {} })
  @Get('incidents/user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Obtener todos los incidentes de todos los monitores del usuario (vista global del dashboard)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por nombre o URL del monitor',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: IncidentSortBy,
    description:
      'Ordenar resultados: recent (más recientes), oldest (más antiguos), name_asc (A-Z), name_desc (Z-A), duration_longest (mayor tiempo caído), duration_shortest (menor tiempo caído)',
    example: IncidentSortBy.RECENT,
  })
  @ApiResponse({ status: 200, type: GetIncidentsByUserIdDto })
  getIncidentsByUserId(
    @Request() req: RequestUserDto,
    @Query() paginationDto: PaginationIncidentsDto,
  ): Promise<GetIncidentsByUserIdDto> {
    return this.uptimeService.getIncidentsByUserId(req.user.dbUserId, paginationDto);
  }

  @Throttle({ medium: {} })
  @Get('incidents/:id')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  @ApiOperation({
    summary: 'Obtener incidentes de un monitor (períodos de caída agrupados), paginado',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: GetIncidentsDto })
  getIncidents(
    @Param('id') id: string,
    @Request() req: RequestUserDto,
    @Query() paginationDto: PaginationIncidentsDto,
  ): Promise<GetIncidentsDto> {
    return this.uptimeService.getIncidents(id, req.user.dbUserId, paginationDto);
  }

  @Throttle({ medium: {} })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  @ApiOperation({ summary: 'Actualizar monitor' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetUptimeDto })
  update(
    @Param('id') id: string,
    @Body() updateUptimeDto: UpdateUptimeDto,
    @Request() req: RequestUserDto,
  ) {
    return this.uptimeService.update(id, updateUptimeDto, req.user.dbUserId);
  }

  @Throttle({ short: {} })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, MonitorOwnerGuard)
  @ApiOperation({ summary: 'Eliminar monitor' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  remove(@Param('id') id: string, @Request() req: RequestUserDto) {
    return this.uptimeService.remove(id, req.user.dbUserId);
  }
}
