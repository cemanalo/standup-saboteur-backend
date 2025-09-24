import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GAME_REPOSITORY, type GameRepository } from '../game.repository';
import { GameEntity } from '../game.entity';

export interface GetGameInput {
  roomCode: string;
}

@Injectable()
export class GetGameUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(input: GetGameInput): Promise<GameEntity> {
    const { roomCode } = input;
    this.logger.log(`Getting game with room code: ${roomCode}`);
    let game: GameEntity | null = null;
    if (roomCode.length === 6) {
      game = await this.gameRepository.findByCode(roomCode);
    } else if (roomCode.length === 36) {
      game = await this.gameRepository.findById(roomCode);
    }

    if (!game) {
      this.logger.warn(`Game not found for room code: ${roomCode}`);
      throw new NotFoundException(`Game not found for room code: ${roomCode}`);
    }
    this.logger.log(`Game found: ${JSON.stringify(game)}`);
    return game;
  }
}
