import { randomUUID } from 'crypto';

export type SubmissionStatus =
  | 'queued'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'error';

export class Submission {
  constructor(
    public readonly id: string,
    public readonly challengeId: string,
    public readonly userId: string,
    public status: SubmissionStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: { challengeId: string; userId: string }) {
    const now = new Date();
    return new Submission(
      randomUUID(),
      props.challengeId,
      props.userId,
      'queued',
      now,
      now,
    );
  }

  start() {
    this.status = 'running';
    this.updatedAt = new Date();
  }

  accept() {
    this.status = 'accepted';
    this.updatedAt = new Date();
  }

  reject() {
    this.status = 'wrong_answer';
    this.updatedAt = new Date();
  }

  fail() {
    this.status = 'error';
    this.updatedAt = new Date();
  }

  static fromPersistence(row: any) {
    return new Submission(
      row.id,
      row.challenge_id,
      row.user_id,
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
