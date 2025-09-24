import { Inject } from '@nestjs/common';
import {
  DAILY_RESULT_REPOSITORY,
  type DailyResultRepository,
} from '../daily.result.repository';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { DailyResultEntity } from '../daily.result.entity';

export class TriggerEndOfDayResultUseCase {
  constructor(
    @Inject(DAILY_RESULT_REPOSITORY)
    private readonly dailyResultRepository: DailyResultRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(gameId: string): Promise<void> {
    const players = await this.playerRepository.findByGameId(gameId);

    // save daily result for each player
    await Promise.all(
      players.map((player) => {
        const dailyResult = {
          gameId,
          playerId: player.id,
          score: player.score,
          date: new Date(),
        };
        const entity = new DailyResultEntity();
        Object.assign(entity, dailyResult);
        return this.dailyResultRepository.save(entity);
      }),
    );
  }
}
