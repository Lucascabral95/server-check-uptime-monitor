import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { envs } from 'src/config/envs.schema';

export interface PgPoolStats {
  total: number;
  idle: number;
  waiting: number;
  max: number;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    // El pool lo creamos y lo dueñamos nosotros (en vez de pasarle un
    // connectionString a PrismaPg y dejar que arme un pool interno con
    // defaults) para poder: (a) tunear max/min/timeouts por env var, y
    // (b) exponer sus métricas (total/idle/waiting) en el health check.
    const pool = new Pool({
      connectionString: envs.database_url,
      max: envs.db_pool_max,
      min: envs.db_pool_min,
      idleTimeoutMillis: envs.db_pool_idle_timeout_ms,
      connectionTimeoutMillis: envs.db_pool_connection_timeout_ms,
      allowExitOnIdle: false,
    });

    const adapter = new PrismaPg(pool, {
      // El pool es externo (lo creamos arriba) y lo cerramos nosotros mismos
      // en onApplicationShutdown — si esto quedara en default (true en
      // versiones futuras) o mal seteado, Prisma podría cerrar el pool antes
      // de que nosotros terminemos de usarlo durante el shutdown ordenado.
      disposeExternalPool: false,
      onPoolError: (err) => {
        this.logger.error(`Unexpected pg pool error: ${err.message}`, err.stack);
      },
    });

    super({ adapter });

    this.pool = pool;

    // Clientes IDLE del pool también pueden emitir 'error' (p.ej. si Postgres
    // cierra la conexión); sin este listener, Node trata un 'error' sin
    // listener como excepción no capturada y tumba el proceso.
    this.pool.on('error', (err) => {
      this.logger.error(`Unexpected idle pg client error: ${err.message}`, err.stack);
    });
  }

  getPoolStats(): PgPoolStats {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      max: envs.db_pool_max,
    };
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Closing database connections (signal: ${signal ?? 'n/a'})`);
    await this.$disconnect();
    await this.pool.end();
  }
}
