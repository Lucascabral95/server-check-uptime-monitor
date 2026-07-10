import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs.schema';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly redis = new Redis({
    host: envs.redis_host,
    port: envs.redis_port,
    password: envs.redis_password,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  async increment(
    key: string,
    ttl: number,
    _limit: number,
    _blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `server-check:throttle:${throttlerName}:${key}`;
    const [totalHits, timeToExpire] = (await this.redis.eval(
      `local hits = redis.call('INCR', KEYS[1])
       if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
       return { hits, redis.call('PTTL', KEYS[1]) }`,
      1,
      redisKey,
      ttl,
    )) as [number, number];

    return {
      totalHits,
      timeToExpire: Math.max(timeToExpire, 0),
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }
}
