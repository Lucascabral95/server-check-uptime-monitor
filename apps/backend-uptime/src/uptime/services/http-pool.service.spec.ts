import { HttpPoolService } from './http-pool.service';

describe('HttpPoolService - response time stats', () => {
  let service: HttpPoolService;

  beforeEach(() => {
    service = new HttpPoolService();
  });

  const recordSuccess = (durationMs: number) => {
    (service as any).recordSuccess('https://example.com', durationMs);
  };

  it('does not sort/recompute percentiles on every recorded check', () => {
    const sortSpy = jest.spyOn(Array.prototype, 'sort');

    recordSuccess(100);
    recordSuccess(200);
    recordSuccess(300);

    expect(sortSpy).not.toHaveBeenCalled();

    sortSpy.mockRestore();
  });

  it('computes fresh average/p95/p99 lazily when getStats() is called', () => {
    for (let i = 1; i <= 100; i++) {
      recordSuccess(i);
    }

    const stats = service.getStats();

    expect(stats.totalRequests).toBe(100);
    expect(stats.averageResponseTime).toBeCloseTo(50.5, 1);
    expect(stats.p95ResponseTime).toBe(95);
    expect(stats.p99ResponseTime).toBe(99);
  });

  it('reuses cached stats when nothing changed since the last getStats() call', () => {
    recordSuccess(10);
    recordSuccess(20);
    service.getStats();

    const sortSpy = jest.spyOn(Array.prototype, 'sort');
    const stats = service.getStats();
    expect(sortSpy).not.toHaveBeenCalled();
    expect(stats.averageResponseTime).toBeCloseTo(15, 1);

    sortSpy.mockRestore();
  });

  it('resetStats clears the dirty flag along with the samples', () => {
    recordSuccess(500);
    service.resetStats();

    const stats = service.getStats();
    expect(stats.averageResponseTime).toBe(0);
    expect(stats.p95ResponseTime).toBe(0);
    expect(stats.totalRequests).toBe(0);
  });
});
