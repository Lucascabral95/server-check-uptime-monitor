import { Test, TestingModule } from '@nestjs/testing';
import { PingLogController } from './ping-log.controller';
import { PingLogService } from './ping-log.service';

describe('PingLogController', () => {
  let controller: PingLogController;

  const pingLogServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingLogController],
      providers: [
        {
          provide: PingLogService,
          useValue: pingLogServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PingLogController>(PingLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
