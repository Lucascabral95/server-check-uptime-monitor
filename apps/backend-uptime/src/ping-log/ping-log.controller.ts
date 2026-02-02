import { 
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
 } from '@nestjs/common';
import { 
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
 } from '@nestjs/swagger';
 import { 
  SkipThrottle,
  Throttle,
 } from '@nestjs/throttler';
import { PingLogService } from './ping-log.service';
import { RequestUserDto } from 'src/user/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationPingLogDto } from './dto/pagination-ping-log.dto';
import { GetPingLogDto } from './dto';

@ApiTags('Ping Logs')
@ApiBearerAuth('jwt-auth')
@Controller('ping-log')
@UseGuards(JwtAuthGuard)
export class PingLogController {
  constructor(private readonly pingLogService: PingLogService) {}

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePingLogDto: UpdatePingLogDto) {
  //   return this.pingLogService.update(id, updatePingLogDto);
  // }

  @Throttle({ short: {} })
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar PingLog por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'PingLog deleted successfully' })
  remove(@Param('id') id: string): Promise<string> {
    return this.pingLogService.remove(id);
  }

  // GET for all ping logs
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Obtener todos los PingLogs (admin/debug)' })
  @ApiResponse({ status: 200, type: [GetPingLogDto] })
  findAll() {
    return this.pingLogService.findAll();
  }

  // Obtener ping logs de monitors creados por un usuario
  @Throttle({ medium: {} })
  @Get("user/my-logs")
  @ApiOperation({ summary: 'Obtener PingLogs de los monitores del usuario autenticado' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'monitorId', required: false, type: String })
  findAllByUser(@Request() req: RequestUserDto, @Query() paginationDto: PaginationPingLogDto) {
    return this.pingLogService.findAllPingLogsByUser(req.user.dbUserId, paginationDto);
  }

  @Throttle({ medium: {} })
  @Get('id/:id')
  @ApiOperation({ summary: 'Obtener PingLog por ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: GetPingLogDto })
  findOne(@Param('id') id: string) {
    return this.pingLogService.findOne(id);
  }
}
