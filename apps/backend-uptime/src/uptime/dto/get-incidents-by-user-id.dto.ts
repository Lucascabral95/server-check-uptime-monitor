import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, IsObject, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { Status } from "@prisma/client";

export class IncidentWithMonitorDto {
    @ApiProperty({
        description: 'Unique identifier for the incident',
        example: 'incident-1737706200000-abc123'
    })
    @IsString()
    id: string;

    @ApiProperty({
        description: 'Monitor ID associated with this incident',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    monitorId: string;

    @ApiProperty({
        description: 'Monitor name for easy identification',
        example: 'My Website'
    })
    @IsString()
    monitorName: string;

    @ApiProperty({
        description: 'Monitor URL being checked',
        example: 'https://example.com'
    })
    @IsString()
    monitorUrl: string;

    @ApiProperty({
        description: 'Current status of the monitor',
        enum: Status,
        example: Status.UP
    })
    @IsString()
    monitorStatus: Status;

    @ApiProperty({
        description: 'Timestamp when the incident started',
        example: '2025-01-24T10:30:00.000Z'
    })
    @IsString()
    startTime: Date;

    @ApiProperty({
        description: 'Timestamp when the incident ended. Null if ongoing.',
        example: '2025-01-24T10:35:23.000Z',
        required: false,
        nullable: true
    })
    @IsString()
    @IsOptional()
    endTime: Date | null;

    @ApiProperty({
        description: 'Duration of the incident in human-readable format',
        example: '5m 23s'
    })
    @IsString()
    duration: string;

    @ApiProperty({
        description: 'Duration of the incident in milliseconds',
        example: 323000
    })
    @IsNumber()
    durationMs: number;

    @ApiProperty({
        description: 'Current status of the incident',
        enum: ['RESOLVED', 'ONGOING'],
        example: 'RESOLVED'
    })
    @IsString()
    status: 'RESOLVED' | 'ONGOING';

    @ApiProperty({
        description: 'Number of failed checks during this incident',
        example: 5
    })
    @IsNumber()
    affectedChecks: number;

    @ApiProperty({
        description: 'Error message from the first failed check',
        example: 'ETIMEDOUT',
        required: false
    })
    @IsString()
    @IsOptional()
    firstError?: string;

    @ApiProperty({
        description: 'Error message from the last failed check',
        example: 'ECONNREFUSED',
        required: false
    })
    @IsString()
    @IsOptional()
    lastError?: string;
}

export class MonitorIncidentSummaryDto {
    @ApiProperty({
        description: 'Monitor ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    monitorId: string;

    @ApiProperty({
        description: 'Monitor name',
        example: 'My Website'
    })
    @IsString()
    monitorName: string;

    @ApiProperty({
        description: 'Monitor URL',
        example: 'https://example.com'
    })
    @IsString()
    monitorUrl: string;

    @ApiProperty({
        description: 'Current status of the monitor',
        enum: Status,
        example: Status.UP
    })
    @IsString()
    monitorStatus: Status;

    @ApiProperty({
        description: 'Number of incidents for this monitor',
        example: 5
    })
    @IsNumber()
    incidentCount: number;

    @ApiProperty({
        description: 'Whether this monitor has an ongoing incident',
        example: false
    })
    @IsString()
    hasOngoingIncident: boolean;

    @ApiProperty({
        description: 'Total downtime for this monitor in human-readable format',
        example: '15m 30s'
    })
    @IsString()
    totalDowntime: string;

    @ApiProperty({
        description: 'Total downtime for this monitor in milliseconds',
        example: 930000
    })
    @IsNumber()
    totalDowntimeMs: number;
}

export class GetIncidentsByUserIdDto {
    @ApiProperty({
        description: 'User ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'All incidents from all monitors, sorted by start time (most recent first)',
        type: [IncidentWithMonitorDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IncidentWithMonitorDto)
    incidents: IncidentWithMonitorDto[];

    @ApiProperty({
        description: 'Summary of incidents grouped by monitor',
        type: [MonitorIncidentSummaryDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MonitorIncidentSummaryDto)
    byMonitor: MonitorIncidentSummaryDto[];

    @ApiProperty({
        description: 'Total number of incidents across all monitors',
        example: 12
    })
    @IsNumber()
    totalIncidents: number;

    @ApiProperty({
        description: 'Total downtime across all monitors in human-readable format',
        example: '2h 15m 30s'
    })
    @IsString()
    totalDowntime: string;

    @ApiProperty({
        description: 'Total downtime across all monitors in milliseconds',
        example: 8130000
    })
    @IsNumber()
    totalDowntimeMs: number;

    @ApiProperty({
        description: 'Number of currently ongoing incidents',
        example: 1
    })
    @IsNumber()
    ongoingIncidents: number;

    @ApiProperty({
        description: 'Number of monitors owned by the user',
        example: 5
    })
    @IsNumber()
    totalMonitors: number;

    @ApiProperty({
        description: 'Number of monitors currently down',
        example: 1
    })
    @IsNumber()
    monitorsDown: number;
}
