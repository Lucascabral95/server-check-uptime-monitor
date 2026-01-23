export interface GetStatsUserInterface {
    totalMonitors: number;
    up: number;
    down: number;
    pending: number;
    downLast24hCount: number;
    downLast24h: Url[];
    hasDowntimeLast24h: boolean;
}

interface Url {
    id: string;
    name: string;
    url: string;
    lastCheck: Date;
}
