import { Monitor, MonitorType, Status } from '@prisma/client';
import { mockRegularUser } from './user.fixture';

export const mockMonitor: Monitor = {
  id: 'monitor-123',
  userId: mockRegularUser.id,
  workspaceId: null,
  projectId: null,
  name: 'Production API',
  url: 'https://api.example.com/health',
  frequency: 60,
  isActive: true,
  nextCheck: new Date('2024-01-15T12:00:00.000Z'),
  lastCheck: new Date('2024-01-15T11:59:00.000Z'),
  status: Status.UP,
  monitorType: MonitorType.HTTP,
  config: {},
  consecutiveFailures: 0,
  consecutiveSuccesses: 0,
  heartbeatSecretHash: null,
  heartbeatIntervalSeconds: null,
  heartbeatGraceSeconds: null,
  heartbeatLastReceivedAt: null,
  maintenanceUntil: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-15T11:59:00.000Z'),
};

export const mockMonitorDown: Monitor = {
  ...mockMonitor,
  id: 'monitor-456',
  name: 'Staging Server',
  url: 'https://staging.example.com',
  status: Status.DOWN,
};

export const mockMonitorPending: Monitor = {
  ...mockMonitor,
  id: 'monitor-789',
  name: 'New Service',
  url: 'https://new-service.example.com',
  status: Status.PENDING,
  lastCheck: null,
};

export const mockMonitors: Monitor[] = [mockMonitor, mockMonitorDown, mockMonitorPending];
