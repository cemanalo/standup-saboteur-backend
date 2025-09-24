import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DailyResultEntity } from './daily.result.entity';

export const DAILY_RESULT_REPOSITORY = Symbol('DAILY_RESULT_REPOSITORY');

export interface DailyResultRepository {
  save(dailyResult: DailyResultEntity): Promise<DailyResultEntity>;
  findByGameId(gameId: string): Promise<DailyResultEntity[]>;
  findByGameIds(gameIds: string[]): Promise<DailyResultEntity[]>;
}

export class DailyResultRepositoryImpl implements DailyResultRepository {
  constructor(
    @InjectRepository(DailyResultEntity)
    private readonly repo: Repository<DailyResultEntity>,
  ) {}

  save(dailyResult: DailyResultEntity): Promise<DailyResultEntity> {
    const entity = this.repo.create(dailyResult);
    return this.repo.save(entity);
  }

  findByGameId(gameId: string): Promise<DailyResultEntity[]> {
    return this.repo.find({ where: { gameId }, order: { date: 'ASC' } });
  }

  findByGameIds(gameIds: string[]): Promise<DailyResultEntity[]> {
    return this.repo.find({
      where: { gameId: In(gameIds) },
      order: { date: 'ASC' },
    });
  }
}
