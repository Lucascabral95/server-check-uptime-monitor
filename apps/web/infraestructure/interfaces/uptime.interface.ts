import { Status } from './enums';

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
  createdAt: string;
  updatedAt: string;
}

// Create monitor DTO
export interface CreateUptimeDto {
  name: string;
  url: string;
  frequency?: number;
}

// Update monitor DTO
export interface UpdateUptimeDto {
  name?: string;
  frequency?: number;
  isActive?: boolean;
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
