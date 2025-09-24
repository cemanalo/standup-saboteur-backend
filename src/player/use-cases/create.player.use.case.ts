import { PlayerEntity } from '../player.entity';
import { PLAYER_REPOSITORY, type PlayerRepository } from '../player.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface CreatePlayerInput {
  name: string;
  pin: string;
  gameId: string;
  socketId: string;
}

@Injectable()
export class CreatePlayerUseCase {
  constructor(
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(input: CreatePlayerInput) {
    const entity: PlayerEntity = new PlayerEntity();
    Object.assign(entity, input);

    const player = await this.playerRepository.save(entity);

    return player;
  }
}
