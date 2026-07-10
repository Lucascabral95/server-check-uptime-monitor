export interface MonitorAggregateDto {
  id: string;
  monitorId: string;
  granularity: "HOURLY" | "DAILY";
  bucketStart: string;
  checks: number;
  successes: number;
  failures: number;
  totalDurationMs: number | string;
  downtimeMs: number | string;
}
