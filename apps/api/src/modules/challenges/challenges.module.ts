import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { CreateChallengeUseCase } from '../../core/challenges/use-cases/create-challenge.use-case';
import { ListChallengesUseCase } from '../../core/challenges/use-cases/list-challenges.use-case';
import { GetChallengeUseCase } from '../../core/challenges/use-cases/get-challenge.use-case';
import { PublishChallengeUseCase } from '../../core/challenges/use-cases/publish-challenge.use-case';
import { ArchiveChallengeUseCase } from '../../core/challenges/use-cases/archive-challenge.use-case';
import { InMemoryChallengeRepo } from '../../infrastructure/database/in-memory/in-memory-challenge.repo';

@Module({
  controllers: [ChallengesController],
  providers: [
    ChallengesService,
    { provide: 'ChallengeRepo', useClass: InMemoryChallengeRepo },
    {
      provide: CreateChallengeUseCase,
      useFactory: (repo: InMemoryChallengeRepo) => new CreateChallengeUseCase(repo),
      inject: ['ChallengeRepo'],
    },
    {
      provide: ListChallengesUseCase,
      useFactory: (repo: InMemoryChallengeRepo) => new ListChallengesUseCase(repo),
      inject: ['ChallengeRepo'],
    },
    {
      provide: GetChallengeUseCase,
      useFactory: (repo: InMemoryChallengeRepo) => new GetChallengeUseCase(repo),
      inject: ['ChallengeRepo'],
    },
    {
      provide: PublishChallengeUseCase,
      useFactory: (repo: InMemoryChallengeRepo) => new PublishChallengeUseCase(repo),
      inject: ['ChallengeRepo'],
    },
    {
      provide: ArchiveChallengeUseCase,
      useFactory: (repo: InMemoryChallengeRepo) => new ArchiveChallengeUseCase(repo),
      inject: ['ChallengeRepo'],
    },
  ],
})
export class ChallengesModule {}
