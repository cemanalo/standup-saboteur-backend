import { FinalScoreEntity } from './final.score.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const FINAL_SCORE_REPOSITORY = Symbol('FINAL_SCORE_REPOSITORY');

export interface FinalScoreRepository {
  getByGameId(gameId: string): Promise<FinalScoreEntity[]>;
  save(finalScore: FinalScoreEntity): Promise<FinalScoreEntity>;
  saveAll(finalScores: FinalScoreEntity[]): Promise<FinalScoreEntity[]>;
}

export class FinalScoreRepositoryImpl implements FinalScoreRepository {
  constructor(
    @InjectRepository(FinalScoreEntity)
    private readonly repository: Repository<FinalScoreEntity>,
  ) {}

  async getByGameId(gameId: string): Promise<FinalScoreEntity[]> {
    return this.repository.find({
      where: { gameId },
      relations: ['player'],
      order: { totalScore: 'DESC' },
    });
  }

  async save(finalScore: FinalScoreEntity): Promise<FinalScoreEntity> {
    return this.repository.save(finalScore);
  }

  async saveAll(finalScores: FinalScoreEntity[]): Promise<FinalScoreEntity[]> {
    const entities = this.repository.create(finalScores);
    return this.repository.save(entities);
  }
}
