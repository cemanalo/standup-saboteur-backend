import {
  ForbiddenException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { GAME_REPOSITORY, type GameRepository } from '../game.repository';
import { GameGateway } from '../game.gateway';

export type KickPlayerInput = {
  roomCode: string;
  ownerId: string;
  targetPlayerId: string;
};

export class KickPlayerUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    private readonly gameGateway: GameGateway,
  ) {}

  async execute(input: KickPlayerInput): Promise<void> {
    const { roomCode, ownerId, targetPlayerId } = input;

    // step 1: validate room owner
    const game = await this.gameRepository.findByCode(roomCode);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // step 2: check if owner matches
    if (game.ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    // step 3: delete player
    await this.playerRepository.deletePlayerById(targetPlayerId);

    // step 4: broadcast event
    this.logger.log('emitting playerKicked event', { targetPlayerId })
    this.gameGateway.server.to(roomCode).emit('playerKicked', { playerId: targetPlayerId})
  }
}
