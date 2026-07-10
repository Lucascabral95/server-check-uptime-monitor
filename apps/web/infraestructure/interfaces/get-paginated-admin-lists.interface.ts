import { GetPingLoginterface } from './get-stats-logs-by-uptime-id.interface';
import { DataUserGetDto } from './user.interface';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  totalItems: number;
  itemsPerPage: number;
}

// GET /ping-log (solo ADMIN) — apps/backend-uptime/src/ping-log/ping-log.service.ts
export interface GetAllPingLogsDto {
  data: GetPingLoginterface[];
  pagination: PaginationInfo;
}

// GET /user (paginado) — apps/backend-uptime/src/user/user.service.ts
export interface GetAllUsersDto {
  data: DataUserGetDto[];
  pagination: PaginationInfo;
}
