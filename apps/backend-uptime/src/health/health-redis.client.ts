import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs.schema';

/**
 * Cliente ioredis dedicado solo a pings de health check — separado del
 * cliente que usa BullMQ para no compartir su ciclo de vida ni su
 * configuración de reintentos (acá un ping debe fallar rápido, no reintentar
 * indefinidamente).
 */
@Injectable()
export class HealthRedisClient implements OnModuleDestroy {
  readonly client = new Redis({
    host: envs.redis_host,
    port: envs.redis_port,
    password: envs.redis_password,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  async onModuleDestroy() {
    this.client.disconnect();
  }
}
