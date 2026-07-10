import { Test, TestingModule } from '@nestjs/testing';
import { IncidentReconcilerService } from './incident-reconciler.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('IncidentReconcilerService', () => {
  let service: IncidentReconcilerService;

  const prismaMock = {
    incident: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentReconcilerService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<IncidentReconcilerService>(IncidentReconcilerService);
  });

  it('does nothing when there are no stale ongoing incidents', async () => {
    prismaMock.incident.findMany.mockResolvedValue([]);

    const count = await service.reconcile();

    expect(count).toBe(0);
    expect(prismaMock.incident.updateMany).not.toHaveBeenCalled();
  });

  it('resolves ongoing incidents whose monitor is no longer DOWN', async () => {
    prismaMock.incident.findMany.mockResolvedValue([{ id: 'incident-1' }, { id: 'incident-2' }]);

    const count = await service.reconcile();

    expect(count).toBe(2);
    expect(prismaMock.incident.findMany).toHaveBeenCalledWith({
      where: { status: 'ONGOING', monitor: { status: { not: 'DOWN' } } },
      select: { id: true },
    });
    expect(prismaMock.incident.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['incident-1', 'incident-2'] } },
      data: { status: 'RESOLVED', endedAt: expect.any(Date) },
    });
  });
});
