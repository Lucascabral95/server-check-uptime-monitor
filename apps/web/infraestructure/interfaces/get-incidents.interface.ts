export interface GetIncidentOfMonitorInterface {
    monitorId: string;
    incidents: IncidentInterface[];
    totalIncidents: number;
    totalDowntime: string;
    totalDowntimeMs: number;
    ongoingIncidents: number;
    // incidents solo trae la página actual (ver apps/backend-uptime
    // src/uptime/dto/get-incidents.dto.ts).
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface IncidentInterface {
    id: string;
    monitorId: string;
    startTime: Date;
    // null cuando el incidente sigue ONGOING.
    endTime: Date | null;
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
