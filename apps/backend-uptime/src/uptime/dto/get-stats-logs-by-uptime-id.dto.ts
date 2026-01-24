import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { GetUptimeDto } from "./get-uptime.dto";

export class HealthStatsDto {
    @ApiProperty({
        description: 'Percentage of successful health checks (0-100)',
        example: 99.5,
        minimum: 0,
        maximum: 100
    })
    @IsNumber()
    healthPercentage: number;

    @ApiProperty({
        description: 'Number of incidents (failed checks) in this period',
        example: 5
    })
    @IsNumber()
    incidentCount: number;

    @ApiProperty({
        description: 'Total number of health checks performed in this period',
        example: 1000
    })
    @IsNumber()
    totalChecks: number;

    @ApiProperty({
        description: 'Total time the server was down in milliseconds',
        example: 3661000
    })
    @IsNumber()
    downtimeMs: number;

    @ApiProperty({
        description: 'Total time the server was down in human-readable format (e.g., "1h 1m 1s")',
        example: '1h 1m 1s'
    })
    @IsString()
    downtimeFormatted: string;

    @ApiProperty({
        description: 'Total time the server was up in milliseconds',
        example: 896339000
    })
    @IsNumber()
    uptimeMs: number;

    @ApiProperty({
        description: 'Total time the server was up in human-readable format (e.g., "10d 2h 3m")',
        example: '10d 2h 3m'
    })
    @IsString()
    uptimeFormatted: string;
}

export class StatsPeriodsDto {
    @ApiProperty({
        description: 'Statistics for the last 24 hours',
        type: HealthStatsDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => HealthStatsDto)
    last24Hours: HealthStatsDto;

    @ApiProperty({
        description: 'Statistics for the last 7 days',
        type: HealthStatsDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => HealthStatsDto)
    last7Days: HealthStatsDto;

    @ApiProperty({
        description: 'Statistics for the last 30 days',
        type: HealthStatsDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => HealthStatsDto)
    last30Days: HealthStatsDto;

    @ApiProperty({
        description: 'Statistics for the last 365 days (1 year)',
        type: HealthStatsDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => HealthStatsDto)
    last365Days: HealthStatsDto;
}

export class GetStatsLogsByUptimeIdDto {
    @ApiProperty({
        description: 'Complete monitor data including all properties',
        type: GetUptimeDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => GetUptimeDto)
    monitor: GetUptimeDto;

    @ApiProperty({
        description: 'Health statistics for different time periods',
        type: StatsPeriodsDto
    })
    @IsObject()
    @ValidateNested()
    @Type(() => StatsPeriodsDto)
    stats: StatsPeriodsDto;
}
