import { MonitorType, Status } from "./enums";

// Monitor uptime interface
export interface GetUptimeDto {
  id: string;
  userId: string;
  name: string;
  url: string;
  frequency: number;
  isActive: boolean;
  nextCheck: Date;
  lastCheck: Date;
  status: Status;
  monitorType?: MonitorType;
  config?: Record<string, unknown>;
  consecutiveFailures?: number;
  consecutiveSuccesses?: number;
  maintenanceWindows?: MaintenanceWindowDto[];
  createdAt: string;
  updatedAt: string;
}

// Create monitor DTO
export interface CreateUptimeDto {
  name: string;
  url: string;
  frequency?: number;
  monitorType?: MonitorType;
  config?: Record<string, unknown>;
  heartbeatIntervalSeconds?: number;
  heartbeatGraceSeconds?: number;
  projectId?: string;
  maintenanceWindows?: MaintenanceWindowDto[];
}

// Update monitor DTO
export interface UpdateUptimeDto {
  name?: string;
  frequency?: number;
  isActive?: boolean;
  monitorType?: MonitorType;
  config?: Record<string, unknown>;
  maintenanceUntil?: string | null;
  maintenanceWindows?: MaintenanceWindowDto[];
}

export interface MaintenanceWindowDto {
  daysOfWeek: number[];
  startMinute: number;
  durationMinutes: number;
  timezone: string;
  enabled?: boolean;
}

// Get all uptimes response
export interface GetAllUptimesDto {
  data: GetUptimeDto[];
  pagination: PaginationGetAllUptimesDto;
}

interface PaginationGetAllUptimesDto {
  currentPage: number;
  totalPages: number;
  nextPage: boolean;
  prevPage: boolean;
  totalItems: number;
  itemsPerPage: number;
}
