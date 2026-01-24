import { Status } from '../enums';

export enum SortBy {
    RECENT = 'recent',
    OLDEST = 'oldest',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    STATUS_DOWN = 'status_down',
    STATUS_UP = 'status_up',
    DURATION_LONGEST = 'duration_longest',
    DURATION_SHORTEST = 'duration_shortest',
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    userId?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
    search?: string;
}
