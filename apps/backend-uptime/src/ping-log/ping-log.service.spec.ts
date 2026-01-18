import { Test, TestingModule } from '@nestjs/testing';
import { PingLogService } from './ping-log.service';

describe('PingLogService', () => {
  let service: PingLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingLogService],
    }).compile();

    service = module.get<PingLogService>(PingLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
