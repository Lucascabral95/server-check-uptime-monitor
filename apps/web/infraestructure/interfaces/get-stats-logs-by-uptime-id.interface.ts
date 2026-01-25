import { GetUptimeDto } from "./uptime.interface";

export interface GetStatsLogsByUptimeIdInterface {
    monitor: GetUptimeWithLogsInterface;
    stats: StatsPeriodsInterface;
}

interface GetUptimeWithLogsInterface extends GetUptimeDto {
    logs: GetPingLoginterface[];
}

export interface GetPingLoginterface {
    id: string;
    monitorId: string;
    statusCode: number;
    durationMs: number;
    error?: string;
    timestamp: Date;
    success: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface StatsPeriodsInterface {
    last24Hours: HealthStatsInterface;
    last7Days: HealthStatsInterface;
    last30Days: HealthStatsInterface;
    last365Days: HealthStatsInterface;
}

interface HealthStatsInterface {
    healthPercentage: number;
    incidentCount: number;
    totalChecks: number;
    downtimeMs: number;
    downtimeFormatted: string;
    uptimeMs: number;
    uptimeFormatted: string;
}