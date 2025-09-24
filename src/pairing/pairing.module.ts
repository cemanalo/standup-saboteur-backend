import { Logger, Module } from '@nestjs/common';
import { PairingController } from './pairing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairingEntity } from './pairing.entity';
import {
  PAIRING_REPOSITORY,
  PairingRepositoryImpl,
} from './pairing.repository';
import * as UseCases from './use-cases';
import {
  PLAYER_REPOSITORY,
  PlayerRepositoryImpl,
} from 'src/player/player.repository';
import { PlayerEntity } from 'src/player/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PairingEntity, PlayerEntity])],
  controllers: [PairingController],
  providers: [
    ...Object.values(UseCases),
    {
      provide: PAIRING_REPOSITORY,
      useClass: PairingRepositoryImpl,
    },
    {
      provide: PLAYER_REPOSITORY,
      useClass: PlayerRepositoryImpl,
    },
    Logger,
  ],
})
export class PairingModule {}
