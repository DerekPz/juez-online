import { createPgPool } from '../infrastructure/database/postgres.provider';
import { createRedisClient } from '../infrastructure/cache/redis.provider';
import { PostgresSubmissionRepo } from '../infrastructure/database/postgres/postgres-submission.repo';
import { Submission } from '../core/Submission/entities/submission.entity';

async function main() {
  const pool = createPgPool();
  const redis = createRedisClient();
  const repo = new PostgresSubmissionRepo(pool);

  console.log('[worker] started. Waiting for jobs...');

  // Limpieza al salir
  const shutdown = async () => {
    console.log('\n[worker] shutting down...');
    await redis.quit();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  while (true) {
    try {
      // BRPOP bloquea hasta que llega un id
      const res = await redis.brpop('queue:submissions', 0);
      if (!res) continue;
      const subId = res[1];
      console.log('[worker] picked job', subId);

      const current = await repo.findById(subId);
      if (!current) {
        console.warn('[worker] submission not found:', subId);
        continue;
      }

      // Marcar running
      current.start();
      await repo.save(current);

      // Simular ejecución
      await new Promise(r => setTimeout(r, 1200));

      // Resultado simulado (aceptado con 70%)
      const accepted = Math.random() < 0.7;
      if (accepted) current.accept();
      else current.reject();

      await repo.save(current);
      console.log('[worker] done', subId, '->', current.status);
    } catch (err) {
      console.error('[worker] error loop:', (err as Error).message);
      // Pequeña pausa ante errores para evitar bucles apretados
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

main().catch(err => {
  console.error('[worker] fatal:', err);
  process.exit(1);
});
