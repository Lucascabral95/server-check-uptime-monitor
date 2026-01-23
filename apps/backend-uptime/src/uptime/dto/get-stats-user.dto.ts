export class GetStatsUserDto {
    totalMonitors: number;
    up: number;
    down: number;
    pending: number;
    downLast24hCount: number;
    downLast24h: Url[];
    hasDowntimeLast24h: boolean;
}

class Url {
    id: string;
    name: string;
    url: string;
    lastCheck: Date;
}