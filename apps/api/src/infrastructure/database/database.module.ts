import { Global, Module } from '@nestjs/common';
import { PG_POOL, createPgPool } from './postgres.provider';

@Global() // opcional; si lo pones, no necesitas importarlo en cada módulo
@Module({
  providers: [
    { provide: PG_POOL, useFactory: () => createPgPool() },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
