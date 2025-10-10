export type ChallengeStatus = 'draft' | 'published' | 'archived';

export class Challenge {
  private constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public status: ChallengeStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

static fromPersistence(row: {
  id: string;
  title: string;
  description: string;
  status: ChallengeStatus;
  created_at: Date | string;
  updated_at: Date | string;
}) {
  return new Challenge(
    row.id,
    row.title,
    row.description,
    row.status,
    new Date(row.created_at),
    new Date(row.updated_at),
  );
}


  static create(params: { id: string; title: string; description: string }) {
    if (!params.title || params.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters');
    }
    const now = new Date();
    return new Challenge(
      params.id,
      params.title.trim(),
      params.description?.trim() ?? '',
      'draft',
      now,
      now,
    );
  }

  publish() {
    if (this.status === 'archived') throw new Error('Cannot publish archived challenge');
    this.status = 'published';
    this.updatedAt = new Date();
  }

  archive() {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  rename(newTitle: string) {
    if (!newTitle || newTitle.trim().length < 3) throw new Error('Title too short');
    this.title = newTitle.trim();
    this.updatedAt = new Date();
  }

  updateDescription(newDesc: string) {
    this.description = (newDesc ?? '').trim();
    this.updatedAt = new Date();
  }
}

