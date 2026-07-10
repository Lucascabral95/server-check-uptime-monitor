import { Controller, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { HeartbeatService } from './heartbeat.service';

@Controller('heartbeats')
export class HeartbeatController {
  constructor(private readonly heartbeatService: HeartbeatService) {}

  @Post(':secret')
  @Throttle({ short: {} })
  receive(@Param('secret') secret: string) {
    return this.heartbeatService.receive(secret);
  }
}
