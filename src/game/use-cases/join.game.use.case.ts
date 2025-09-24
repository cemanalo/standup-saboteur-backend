import { Inject, Logger } from '@nestjs/common';
import { GAME_REPOSITORY, type GameRepository } from '../game.repository';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { PlayerEntity } from 'src/player/player.entity';

export interface JoinGameInput {
  roomCode: string;
  name: string;
  pin: string;
  avatarSeed: string;
}

export class JoinGameUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(input: JoinGameInput) {
    // step 1: validate room code and get game
    const game = await this.gameRepository.findByCode(input.roomCode);
    if (!game) {
      throw new Error('Game not found');
    }

    let player = await this.playerRepository.findByNameAndGameId(
      input.name,
      game.id,
    );

    // step 2:create new player if not found
    if (!player) {
      const newPlayer = new PlayerEntity();
      Object.assign(newPlayer, {
        name: input.name,
        pin: input.pin,
        gameId: game.id,
        avatarSeed: input.avatarSeed,
      });
      player = await this.playerRepository.save(newPlayer);
      this.logger.log(`New player joined game: ${input.name}`);
    }

    // step 3: validate pin
    const encryptInputPin = Buffer.from(input.pin.toString()).toString(
      'base64',
    );
    if (player.pin !== encryptInputPin) {
      this.logger.log(
        `Invalid PIN attempt for player: ${input.name}, ${input.pin}:${player.pin}:${encryptInputPin}`,
      );
      throw new Error('Invalid PIN');
    }

    return player;
  }
}
