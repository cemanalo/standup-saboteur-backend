import { Logger, Module } from '@nestjs/common';
import { FinalScoreController } from './final.score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalScoreEntity } from './final.score.entity';
import { TallyFinalScoreUseCase } from './use-cases/tally.final.score.use.case';
import {
  FINAL_SCORE_REPOSITORY,
  FinalScoreRepositoryImpl,
} from './final.score.repository';
import { GAME_REPOSITORY, GameRepositoryImpl } from 'src/game/game.repository';
import {
  DAILY_RESULT_REPOSITORY,
  DailyResultRepositoryImpl,
} from 'src/daily-result/daily.result.repository';
import { GameEntity } from 'src/game/game.entity';
import { DailyResultEntity } from 'src/daily-result/daily.result.entity';
import { GetFinalScoreByGameUseCase } from './use-cases/get.final.score.by.game.use.case';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinalScoreEntity, GameEntity, DailyResultEntity]),
  ],
  controllers: [FinalScoreController],
  providers: [
    TallyFinalScoreUseCase,
    GetFinalScoreByGameUseCase,
    Logger,
    {
      provide: FINAL_SCORE_REPOSITORY,
      useClass: FinalScoreRepositoryImpl,
    },
    {
      provide: GAME_REPOSITORY,
      useClass: GameRepositoryImpl,
    },
    {
      provide: DAILY_RESULT_REPOSITORY,
      useClass: DailyResultRepositoryImpl,
    },
  ],
})
export class FinalScoreModule {}
