import { Module } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';
import { DbController } from './modules/database/db.controller';
import { PG_POOL, createPgPool } from './infrastructure/database/postgres.provider';
import { CacheController } from './modules/cache/cache.controller';
import { REDIS_CLIENT, createRedisClient } from './infrastructure/cache/redis.provider';
import { AuthModule } from './modules/auth/auth.module';
import { ChallengesModule } from './modules/challenges/challenges.module';

@Module({
  imports: [AuthModule, ChallengesModule],
  controllers: [HealthController, DbController, CacheController],
  providers: [
    { provide: PG_POOL, useFactory: () => createPgPool() },
    { provide: REDIS_CLIENT, useFactory: () => createRedisClient() },
  ],
})
export class AppModule {}
