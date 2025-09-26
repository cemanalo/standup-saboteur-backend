import { Injectable, Inject, Logger } from '@nestjs/common';
import { GameEntity } from '../game.entity';
import { GAME_REPOSITORY, type GameRepository } from 'src/game/game.repository';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { PlayerEntity } from 'src/player/player.entity';

export interface CreateGameInput {
  ownerName: string;
  ownerPin: string;
  ownerSocketId: string;
  avatarSeed: string;
  // mode?: 'classic' | 'timed';
}

@Injectable()
export class CreateGameUseCase {
  constructor(
    @Inject()
    private readonly logger: Logger,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(input: CreateGameInput): Promise<GameEntity> {
    // step 1: create player entity
    const playerEntity = new PlayerEntity();
    Object.assign(playerEntity, {
      name: input.ownerName,
      pin: input.ownerPin,
      avatarSeed: input.avatarSeed,
      socketId: input.ownerSocketId, // socketId will be assigned when the player connects via WebSocket
    });

    const savedPlayer = await this.playerRepository.save(playerEntity);
    this.logger.log(`Owner player created: ${input.ownerName}`);

    // step 2: create owner as game entity
    const gameEntity = new GameEntity();
    Object.assign(gameEntity, {
      ownerId: savedPlayer.id,
      roomCode: this.generateRoomCode(),
      // mode: input.mode,
    });

    const savedGame = await this.gameRepository.save(gameEntity);
    this.logger.log(`Game created: ${savedGame.id}`);

    // step 3: update player entity with gameId
    await this.playerRepository.update(savedPlayer.id, {
      gameId: savedGame.id,
    });
    this.logger.log(`Player updated with gameId: ${playerEntity.gameId}`);

    return savedGame;
  }

  generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
