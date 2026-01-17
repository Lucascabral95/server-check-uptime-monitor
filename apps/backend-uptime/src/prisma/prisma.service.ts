import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { envs } from 'src/config/envs.schema';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
    const adapter = new PrismaPg({
      connectionString: envs.database_url as string,
    });
    super({ adapter });
  }
}
