import { Injectable } from '@nestjs/common';
import { CreateUptimeDto } from './dto/create-uptime.dto';
import { UpdateUptimeDto } from './dto/update-uptime.dto';

@Injectable()
export class UptimeService {
  create(createUptimeDto: CreateUptimeDto) {
    return 'This action adds a new uptime';
  }

  findAll() {
    return `This action returns all uptime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} uptime`;
  }

  update(id: number, updateUptimeDto: UpdateUptimeDto) {
    return `This action updates a #${id} uptime`;
  }

  remove(id: number) {
    return `This action removes a #${id} uptime`;
  }
}
