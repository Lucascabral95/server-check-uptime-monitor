import { Test, TestingModule } from '@nestjs/testing';
import { UptimeService } from './uptime.service';

describe('UptimeService', () => {
  let service: UptimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UptimeService],
    }).compile();

    service = module.get<UptimeService>(UptimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
