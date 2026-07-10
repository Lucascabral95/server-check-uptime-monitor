import { MonitorType } from '@prisma/client';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH';

export interface HttpMonitorConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCodes?: number[];
  expectedText?: string;
  expectedJsonPath?: string;
  expectedJsonValue?: unknown;
  timeoutMs?: number;
  maxResponseBytes?: number;
  followRedirects?: boolean;
}

export interface MonitorConfig {
  http?: HttpMonitorConfig;
  ssl?: { alertBeforeDays?: number };
}

export function parseMonitorConfig(value: unknown): MonitorConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as MonitorConfig;
}

export function defaultConfigFor(type: MonitorType): MonitorConfig {
  return type === MonitorType.HTTP ? { http: {} } : {};
}
