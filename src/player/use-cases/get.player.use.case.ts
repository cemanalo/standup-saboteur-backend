import { Inject } from '@nestjs/common';
import { PlayerEntity } from '../player.entity';
import { PLAYER_REPOSITORY, type PlayerRepository } from '../player.repository';

export type GetPlayerUseCaseInput = {
  gameId: string;
  playerId: string;
};

export class GetPlayerUseCase {
  constructor(
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(input: GetPlayerUseCaseInput): Promise<PlayerEntity | null> {
    const { gameId, playerId } = input;

    return this.playerRepository.findByIdAndGameId(playerId, gameId);
  }
}
