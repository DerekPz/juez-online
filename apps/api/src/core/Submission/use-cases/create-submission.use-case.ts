import { Submission } from '../entities/submission.entity';
import { ISubmissionRepo } from '../interfaces/submission.repo';
import { ISubmissionQueue } from '../interfaces/submission.queue';
import { IChallengeRepo } from '../../challenges/interfaces/challenge.repo';

type Input = { challengeId: string; userId: string };
type Output = Submission;

export class CreateSubmissionUseCase {
  constructor(
    private readonly repo: ISubmissionRepo,
    private readonly queue: ISubmissionQueue | undefined,
    private readonly challengeRepo: IChallengeRepo,   // 👈 añadimos lectura de challenges
  ) {}

  async execute(input: Input): Promise<Output> {
    if (!input.challengeId) throw new Error('challengeId is required');
    if (!input.userId) throw new Error('userId is required');

    // ✅ Validar que exista el reto
    const challenge = await this.challengeRepo.findById(input.challengeId);
    if (!challenge) {
      throw new Error('challenge_not_found');
    }

    const sub = Submission.create({
      challengeId: input.challengeId,
      userId: input.userId,
    });

    await this.repo.save(sub);
    if (this.queue) await this.queue.enqueue(sub.id);

    return sub;
  }
}
