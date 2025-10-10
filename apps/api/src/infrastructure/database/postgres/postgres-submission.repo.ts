import { Pool } from 'pg';
import { Submission } from '../../../core/Submission/entities/submission.entity';
import { ISubmissionRepo } from '../../../core/Submission/interfaces/submission.repo';

export class PostgresSubmissionRepo implements ISubmissionRepo {
  constructor(private readonly pool: Pool) {}

  async save(sub: Submission): Promise<void> {
    const sql = `
      INSERT INTO public.submissions (id, challenge_id, user_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        challenge_id = EXCLUDED.challenge_id,
        user_id      = EXCLUDED.user_id,
        status       = EXCLUDED.status,
        updated_at   = NOW()
    `;
    const vals = [sub.id, sub.challengeId, sub.userId, sub.status, sub.createdAt, sub.updatedAt];
    await this.pool.query(sql, vals);
  }

  async findById(id: string): Promise<Submission | null> {
    const { rows } = await this.pool.query(
      `SELECT id, challenge_id, user_id, status, created_at, updated_at
         FROM public.submissions
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    if (!rows.length) return null;
    return Submission.fromPersistence(rows[0]);
  }

  // 👇 Nuevo: listado con filtros y paginación
  async list(params: {
    challengeId?: string;
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Submission[]> {
    const conds: string[] = [];
    const vals: any[] = [];
    let i = 1;

    if (params.challengeId) { conds.push(`challenge_id = $${i++}`); vals.push(params.challengeId); }
    if (params.userId)      { conds.push(`user_id = $${i++}`);      vals.push(params.userId); }
    if (params.status)      { conds.push(`status = $${i++}`);       vals.push(params.status); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const limit = Number.isFinite(params.limit) ? Number(params.limit) : 20;
    const offset = Number.isFinite(params.offset) ? Number(params.offset) : 0;

    const sql = `
      SELECT id, challenge_id, user_id, status, created_at, updated_at
        FROM public.submissions
        ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}
    `;
    const { rows } = await this.pool.query(sql, vals);
    return rows.map(Submission.fromPersistence);
  }

  // 👇 Nuevo: total para paginación
  async count(params: { challengeId?: string; userId?: string; status?: string }): Promise<number> {
    const conds: string[] = [];
    const vals: any[] = [];
    let i = 1;

    if (params.challengeId) { conds.push(`challenge_id = $${i++}`); vals.push(params.challengeId); }
    if (params.userId)      { conds.push(`user_id = $${i++}`);      vals.push(params.userId); }
    if (params.status)      { conds.push(`status = $${i++}`);       vals.push(params.status); }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const { rows } = await this.pool.query(
      `SELECT COUNT(*)::int AS n FROM public.submissions ${where}`,
      vals,
    );
    return rows[0]?.n ?? 0;
  }
}
