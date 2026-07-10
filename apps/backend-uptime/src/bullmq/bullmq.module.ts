import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { envs } from 'src/config/envs.schema';

export const QUEUES_NAME = {
  UPTIME_MONITOR: 'uptime-monitor',
  UPTIME_MONITOR_DLQ: 'uptime-monitor-dlq', // Dead Letter Queue
  NOTIFICATIONS: 'notifications',
};

// REDIS_PASSWORD es .required() en envs.schema.ts, pero las 4 conexiones de
// abajo nunca la pasaban — se conectaban a Redis sin autenticar. Compartir
// una única constante evita que quede sin actualizar en alguna de las 4.
export const redisConnection = {
  host: envs.redis_host || 'localhost',
  port: envs.redis_port || 6379,
  password: envs.redis_password,
  maxRetriesPerRequest: null, // requerido por BullMQ para los workers
  enableReadyCheck: true,
};

@Module({
  imports: [
    // Cola principal de monitoreo
    BullModule.registerQueue({
      name: QUEUES_NAME.UPTIME_MONITOR,
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3, // Número de intentos antes de mover a DLQ
        backoff: {
          type: 'exponential', // Backoff exponencial
          delay: 1000, // Empezar con 1 segundo
        },
        removeOnComplete: {
          count: 100, // Mantener últimos 100 jobs completados
          age: 3600, // O 1 hora
        },
        removeOnFail: {
          count: 5000, // Mantener jobs fallidos para debugging
          age: 86400, // O 24 horas
        },
      },
    }),
    BullModule.registerQueue({
      name: QUEUES_NAME.NOTIFICATIONS,
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 8,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    }),

    // Dead Letter Queue para retries extendidos
    BullModule.registerQueue({
      name: QUEUES_NAME.UPTIME_MONITOR_DLQ,
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 5, // Más intentos en DLQ
        backoff: {
          type: 'exponential',
          delay: 30000, // Empezar con 30 segundos
        },
        removeOnComplete: {
          count: 50,
        },
        removeOnFail: {
          count: 10000, // Mantener más jobs fallidos en DLQ
          age: 604800, // 7 días
        },
      },
    }),
    BullModule.registerQueue({ name: QUEUES_NAME.NOTIFICATIONS, connection: redisConnection }),
  ],
  exports: [
    BullModule.registerQueue({
      name: QUEUES_NAME.UPTIME_MONITOR,
      connection: redisConnection,
    }),
    BullModule.registerQueue({
      name: QUEUES_NAME.UPTIME_MONITOR_DLQ,
      connection: redisConnection,
    }),
  ],
})
export class BullmqModule {}
