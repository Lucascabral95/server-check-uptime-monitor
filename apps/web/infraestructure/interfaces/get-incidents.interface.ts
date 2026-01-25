export interface GetIncidentOfMonitorInterface {
    monitorId: string; 
    incidents: IncidentInterface[];
    totalIncidents: number;
    totalDowntime: string;
    totalDowntimeMs: number;
    ongoingIncidents: number;
}

export interface IncidentInterface {
    id: string;
    monitorId: string;
    startTime: Date;
    endTime: Date;
    duration: string;
    durationMs: number;
    status: StatusIncident;
    affectedChecks: number;
    firstError?: string;
    lastError?: string;
}

export enum StatusIncident {
    ONGOING = 'ONGOING',
    RESOLVED = 'RESOLVED',
}