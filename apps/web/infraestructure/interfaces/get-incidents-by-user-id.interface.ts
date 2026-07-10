export interface GetIncidentsByUserIdInterface {
    userId: string;
    incidents: IncidentsInterface[];
    byMonitor: MonitorIncidentSummaryInterface[];
    totalIncidents: number;
    totalDowntime: string;
    totalDowntimeMs: number;
    ongoingIncidents: number;
    totalMonitors: number;
    monitorsDown: number;
    // incidents solo trae la página actual; byMonitor no está paginado.
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
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
    // null cuando el incidente sigue ONGOING (ver apps/backend-uptime
    // src/uptime/dto/get-incidents-by-user-id.dto.ts).
    endTime: Date | null;
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
