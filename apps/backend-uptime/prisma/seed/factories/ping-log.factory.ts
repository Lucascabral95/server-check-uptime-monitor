import { PingLog } from '@prisma/client';

export class PingLogFactory {
  static create(
    monitorId: string,
    index: number,
    isMonitorHealthy: boolean,
    overrides?: Partial<PingLog>,
  ): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    
    let success: boolean;
    let statusCode: number;
    let error: string | null;
    let durationMs: number;

    if (isMonitorHealthy) {
      success = index >= 28 ? false : true;
      statusCode = success ? 200 : 503;
      error = success ? null : 'Temporary network issue';
      durationMs = success ? 100 + (index * 10) : 5000; 
    } else {
      success = index < 3 ? true : false;
      statusCode = success ? 200 : (index % 2 === 0 ? 500 : 503);
      error = success ? null : (index % 2 === 0 ? 'Internal Server Error' : 'Service Unavailable');
      durationMs = success ? 150 + (index * 10) : 3000 + (index * 50); 
    }
    
    return {
      monitorId,
      statusCode,
      durationMs,
      error,
      timestamp: new Date(now.getTime() - (index * 60 * 60 * 1000)), 
      success,
      ...overrides,
    };
  }

  static createMany(
    monitorId: string,
    count: number,
    isMonitorHealthy: boolean,
  ): Omit<PingLog, 'id' | 'createdAt' | 'updatedAt'>[] {
    return Array.from({ length: count }, (_, index) => 
      this.create(monitorId, index, isMonitorHealthy)
    );
  }
}