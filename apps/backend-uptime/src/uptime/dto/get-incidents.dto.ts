import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, IsObject, ValidateNested, IsOptional, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export class IncidentDto {
    @ApiProperty({
        description: 'Unique identifier for the incident (generated from timestamp and monitor ID)',
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
        description: 'Timestamp when the incident started (first failed check)',
        example: '2025-01-24T10:30:00.000Z'
    })
    @IsDateString()
    startTime: Date;

    @ApiProperty({
        description: 'Timestamp when the incident ended (first successful check after the incident). Null if the incident is still ongoing.',
        example: '2025-01-24T10:35:23.000Z',
        required: false,
        nullable: true
    })
    @IsDateString()
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

export class GetIncidentsDto {
    @ApiProperty({
        description: 'Monitor ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    monitorId: string;

    @ApiProperty({
        description: 'List of incidents for this monitor',
        type: [IncidentDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IncidentDto)
    incidents: IncidentDto[];

    @ApiProperty({
        description: 'Total number of incidents',
        example: 12
    })
    @IsNumber()
    totalIncidents: number;

    @ApiProperty({
        description: 'Total downtime across all incidents in human-readable format',
        example: '2h 15m 30s'
    })
    @IsString()
    totalDowntime: string;

    @ApiProperty({
        description: 'Total downtime across all incidents in milliseconds',
        example: 8130000
    })
    @IsNumber()
    totalDowntimeMs: number;

    @ApiProperty({
        description: 'Number of currently ongoing incidents (should be 0 or 1)',
        example: 0
    })
    @IsNumber()
    ongoingIncidents: number;
}
