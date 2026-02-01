import { PingLog } from '@prisma/client';
import { mockMonitor } from './monitor.fixture';

export const mockSuccessfulPingLog: PingLog = {
  id: 'log-123',
  monitorId: mockMonitor.id,
  statusCode: 200,
  durationMs: 145,
  error: null,
  timestamp: new Date('2024-01-15T11:59:00.000Z'),
  success: true,
  createdAt: new Date('2024-01-15T11:59:00.000Z'),
  updatedAt: new Date('2024-01-15T11:59:00.000Z'),
};

export const mockFailedPingLog: PingLog = {
  id: 'log-456',
  monitorId: mockMonitor.id,
  statusCode: 500,
  durationMs: 3045,
  error: 'Internal Server Error',
  timestamp: new Date('2024-01-15T10:00:00.000Z'),
  success: false,
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  updatedAt: new Date('2024-01-15T10:00:00.000Z'),
};

export const mockTimeoutPingLog: PingLog = {
  id: 'log-789',
  monitorId: mockMonitor.id,
  statusCode: 504,
  durationMs: 30000,
  error: 'Gateway Timeout',
  timestamp: new Date('2024-01-15T09:00:00.000Z'),
  success: false,
  createdAt: new Date('2024-01-15T09:00:00.000Z'),
  updatedAt: new Date('2024-01-15T09:00:00.000Z'),
};

export const mockPingLogs: PingLog[] = [
  mockSuccessfulPingLog,
  mockFailedPingLog,
  mockTimeoutPingLog,
];