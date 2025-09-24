import { Inject } from '@nestjs/common';
import { FinalScoreEntity } from '../final.score.entity';
import {
  FINAL_SCORE_REPOSITORY,
  type FinalScoreRepository,
} from '../final.score.repository';

export class GetFinalScoreByGameUseCase {
  constructor(
    @Inject(FINAL_SCORE_REPOSITORY)
    private readonly finalScoreRepository: FinalScoreRepository,
  ) {}

  async execute(gameId: string): Promise<FinalScoreEntity[]> {
    return this.finalScoreRepository.getByGameId(gameId);
  }
}
