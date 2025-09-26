import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { GameController } from './game.controller';
import { GAME_REPOSITORY, GameRepositoryImpl } from './game.repository';
import { CreateGameUseCase } from './use-cases/create.game.use.case';
import {
  PLAYER_REPOSITORY,
  PlayerRepositoryImpl,
} from 'src/player/player.repository';
import { PlayerEntity } from 'src/player/player.entity';
import { GameGateway } from './game.gateway';
import { GetGameUseCase } from './use-cases/get.game.use.case';
import { JoinGameUseCase } from './use-cases/join.game.use.case';
import { StartGameUseCase } from './use-cases/start.game.use.case';
import { KickPlayerUseCase } from './use-cases/kick.player.use.case';
import {
  FINAL_SCORE_REPOSITORY,
  FinalScoreRepositoryImpl,
} from 'src/final-score/final.score.repository';
import { FinalScoreEntity } from 'src/final-score/final.score.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity, PlayerEntity, FinalScoreEntity]),
  ],
  controllers: [GameController],
  providers: [
    {
      provide: GAME_REPOSITORY,
      useClass: GameRepositoryImpl,
    },
    {
      provide: PLAYER_REPOSITORY,
      useClass: PlayerRepositoryImpl,
    },
    {
      provide: FINAL_SCORE_REPOSITORY,
      useClass: FinalScoreRepositoryImpl,
    },
    CreateGameUseCase,
    GetGameUseCase,
    JoinGameUseCase,
    StartGameUseCase,
    KickPlayerUseCase,
    Logger,
    GameGateway,
  ],
  exports: [CreateGameUseCase, GetGameUseCase, GameGateway],
})
export class GameModule {}
