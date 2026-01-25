export interface GetIncidentsByUserIdInterface {
    userId: string;
    incidents: IncidentsInterface[];
    byMonitor: MonitorIncidentSummaryInterface[];
    totalIncidents: string;
    totalDowntime: string;
    totalDowntimeMs: number;
    ongoingIncidents: number;
    totalMonitors: number;
    monitorsDown: number;
}

interface MonitorIncidentSummaryInterface {
    monitorId: string;
    monitorName: string;
    monitorUrl: string;
    monitorStatus: Status;
    incidentCount: number;
    hasOngoingIncident: boolean;
    totalDowntime: string;
    totalDowntimeMs: number;
}

export interface IncidentsInterface {
    id: string;
    monitorId: string;
    monitorName: string;
    monitorUrl: string;
    monitorStatus: Status;
    startTime: Date;
    endTime: Date;
    duration: string;
    durationMs: number;
    status: StatusIncident;
    affectedChecks: number;
    firstError?: string;
    lastError?: string
}

enum Status {
    UP = 'UP',
    DOWN = 'DOWN',
    PENDING = 'PENDING',
}

enum StatusIncident {
    ONGOING = 'ONGOING',
    RESOLVED = 'RESOLVED',
}