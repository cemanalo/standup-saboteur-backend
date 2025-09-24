import { Inject, Logger } from '@nestjs/common';
import {
  DAILY_RESULT_REPOSITORY,
  type DailyResultRepository,
} from '../daily.result.repository';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';

export class GetDailyResultByGameUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(DAILY_RESULT_REPOSITORY)
    private readonly dailyResultRepository: DailyResultRepository,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(gameId: string) {
    const results = await this.dailyResultRepository.findByGameId(gameId);
    this.logger.log(
      `Fetched ${results.length} daily results for gameId: ${gameId}`,
    );
    const players = await this.playerRepository.findByGameId(gameId);
    this.logger.log(`Fetched ${players.length} players for gameId: ${gameId}`);
    return results.map((r) => {
      const player = players.find((p) => p.id === r.playerId);
      return {
        id: r.id,
        date: r.date,
        score: r.score,
        funnyName: player?.funnyName ?? player?.name,
        playerId: player?.id,
        gameId: r.gameId,
      };
    });
  }
}
