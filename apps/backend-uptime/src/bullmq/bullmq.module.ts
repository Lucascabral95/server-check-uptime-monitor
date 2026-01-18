import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { envs } from 'src/config/envs.schema';

export const QUEUES_NAME = {
    UPTIME_MONITOR: 'uptime-monitor',
    UPTIME_MONITOR_DLQ: 'uptime-monitor-dlq', // Dead Letter Queue
};

@Module({
    imports: [
        // Cola principal de monitoreo
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR,
            connection: {
                host: envs.redis_host || 'localhost',
                port: envs.redis_port || 6379,
            },
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

        // Dead Letter Queue para retries extendidos
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR_DLQ,
            connection: {
                host: envs.redis_host || 'localhost',
                port: envs.redis_port || 6379,
            },
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
    ],
    exports: [
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR,
            connection: {
                host: envs.redis_host || 'localhost',
                port: envs.redis_port || 6379,
            },
        }),
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR_DLQ,
            connection: {
                host: envs.redis_host || 'localhost',
                port: envs.redis_port || 6379,
            },
        }),
    ],
})
export class BullmqModule {}
