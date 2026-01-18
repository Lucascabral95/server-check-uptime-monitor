import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PingLogService } from './ping-log.service';
import { CreatePingLogDto } from './dto/create-ping-log.dto';
import { UpdatePingLogDto } from './dto/update-ping-log.dto';

@Controller('ping-log')
export class PingLogController {
  constructor(private readonly pingLogService: PingLogService) {}

  @Post()
  create(@Body() createPingLogDto: CreatePingLogDto) {
    return this.pingLogService.create(createPingLogDto);
  }

  @Get()
  findAll() {
    return this.pingLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pingLogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePingLogDto: UpdatePingLogDto) {
    return this.pingLogService.update(id, updatePingLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pingLogService.remove(id);
  }
}
