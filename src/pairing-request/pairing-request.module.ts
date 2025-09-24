import { Logger, Module } from '@nestjs/common';
import { PairingRequestEntity } from './pairing.request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairingEntity } from '../pairing/pairing.entity';
import { PairingRequestController } from './pairing-request.controller';
import * as UseCases from './use-cases';
import {
  PAIRING_REPOSITORY,
  PairingRepositoryImpl,
} from '../pairing/pairing.repository';
import {
  PAIRING_REQUEST_REPOSITORY,
  PairingRequestRepositoryImpl,
} from '../pairing/pairing.request.repository';
import {
  PLAYER_REPOSITORY,
  PlayerRepositoryImpl,
} from 'src/player/player.repository';
import { GameModule } from 'src/game/game.module';
import { PlayerModule } from 'src/player/player.module';
import { PlayerEntity } from 'src/player/player.entity';
import { PairingModule } from 'src/pairing/pairing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PairingRequestEntity,
      PairingEntity,
      PlayerEntity,
    ]),
    GameModule,
    PlayerModule,
    PairingModule,
  ],
  controllers: [PairingRequestController],
  providers: [
    ...Object.values(UseCases),
    {
      provide: PAIRING_REPOSITORY,
      useClass: PairingRepositoryImpl,
    },
    {
      provide: PAIRING_REQUEST_REPOSITORY,
      useClass: PairingRequestRepositoryImpl,
    },
    {
      provide: PLAYER_REPOSITORY,
      useClass: PlayerRepositoryImpl,
    },
    Logger,
  ],
})
export class PairingRequestModule {}
