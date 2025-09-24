import { Module } from '@nestjs/common';
import { PlayerEntity } from './player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerController } from './player.controller';
import { PLAYER_REPOSITORY, PlayerRepositoryImpl } from './player.repository';
import { CreatePlayerUseCase } from './use-cases/create.player.use.case';
import { GameModule } from 'src/game/game.module';
import { GameEntity } from 'src/game/game.entity';
import { GetPlayerUseCase } from './use-cases/get.player.use.case';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerEntity, GameEntity]), GameModule],
  controllers: [PlayerController],
  providers: [
    {
      provide: PLAYER_REPOSITORY,

      useClass: PlayerRepositoryImpl,
    },
    CreatePlayerUseCase,
    GetPlayerUseCase,
  ],
  exports: [CreatePlayerUseCase, PLAYER_REPOSITORY],
})
export class PlayerModule {}
