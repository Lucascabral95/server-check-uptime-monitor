import { GetUptimeDto } from "./get-uptime.dto";

export class GetAllUptimesDto {
    data: GetUptimeDto[];
    pagination: PaginationGetAllUptimesDto;
}

class PaginationGetAllUptimesDto {
     currentPage: number;
     totalPages: number;
     nextPage: boolean;
     prevPage: boolean;
     totalItems: number;
     itemsPerPage: number;
}