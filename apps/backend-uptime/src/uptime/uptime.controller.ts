import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UptimeService } from './uptime.service';
import { CreateUptimeDto } from './dto/create-uptime.dto';
import { UpdateUptimeDto } from './dto/update-uptime.dto';

@Controller('uptime')
export class UptimeController {
  constructor(private readonly uptimeService: UptimeService) {}

  @Post()
  create(@Body() createUptimeDto: CreateUptimeDto) {
    return this.uptimeService.create(createUptimeDto);
  }

  @Get()
  findAll() {
    return this.uptimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uptimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUptimeDto: UpdateUptimeDto) {
    return this.uptimeService.update(+id, updateUptimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uptimeService.remove(+id);
  }
}
