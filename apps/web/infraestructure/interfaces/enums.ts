export enum Status {
  UP = 'UP',
  DOWN = 'DOWN',
  PENDING = 'PENDING',
  DEGRADED = 'DEGRADED',
  PAUSED = 'PAUSED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum MonitorType {
  HTTP = 'HTTP',
  SSL = 'SSL',
  HEARTBEAT = 'HEARTBEAT',
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}
