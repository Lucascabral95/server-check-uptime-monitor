import { Test, TestingModule } from '@nestjs/testing';
import { PingLogController } from './ping-log.controller';
import { PingLogService } from './ping-log.service';

describe('PingLogController', () => {
  let controller: PingLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingLogController],
      providers: [PingLogService],
    }).compile();

    controller = module.get<PingLogController>(PingLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
