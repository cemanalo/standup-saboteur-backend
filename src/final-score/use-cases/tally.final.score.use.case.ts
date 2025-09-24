import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  FINAL_SCORE_REPOSITORY,
  type FinalScoreRepository,
} from '../final.score.repository';
import { GAME_REPOSITORY, type GameRepository } from 'src/game/game.repository';
import {
  DAILY_RESULT_REPOSITORY,
  type DailyResultRepository,
} from 'src/daily-result/daily.result.repository';
import { FinalScoreEntity } from '../final.score.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TallyFinalScoreUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(FINAL_SCORE_REPOSITORY)
    private readonly finalScoreRepository: FinalScoreRepository,
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(DAILY_RESULT_REPOSITORY)
    private readonly dailyResultRepository: DailyResultRepository,
  ) {}

  // run every thursday at 11:55 PM
  @Cron('55 23 * * 4')
  async execute(): Promise<void> {
    this.logger.log('Tallying final scores...');
    // step 1: fetch pending games
    const pendingGames = await this.gameRepository.getPendingGames();
    this.logger.log(`Found ${pendingGames.length} pending games.`);

    if (pendingGames.length === 0) {
      this.logger.log('No pending games found. Exiting.');
      return;
    }

    // step 2: for each pending game, fetch daily scores
    const dailyScores = await this.dailyResultRepository.findByGameIds(
      pendingGames.map((game) => game.id),
    );
    this.logger.log(`Fetched ${dailyScores.length} daily scores.`);

    if (dailyScores.length === 0) {
      this.logger.log('No daily scores found. Exiting.');
      return;
    }
    // step 3: group by playerId and gameId and sum scores
    const scoresByPlayerAndGame = dailyScores.reduce((acc, dailyScore) => {
      const key = `${dailyScore.playerId}#${dailyScore.gameId}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += dailyScore.score;
      return acc;
    }, {});
    this.logger.log(
      `Computed final scores for ${Object.keys(scoresByPlayerAndGame).length} player-game combinations.`,
    );

    const today = new Date();
    const weekEnding = today.toISOString().split('T')[0];

    // step 4: tally final scores per player per game
    const finalScores = Object.entries(scoresByPlayerAndGame).map(
      ([key, score]) => {
        const [playerId, gameId] = key.split('#');
        const finalScore = new FinalScoreEntity();
        Object.assign(finalScore, {
          playerId,
          gameId,
          totalScore: score,
          weekEnding,
        });
        return finalScore;
      },
    );
    this.logger.log(`Prepared ${finalScores.length} final score entries.`);

    if (finalScores.length === 0) {
      this.logger.log('No final scores to save. Exiting.');
      return;
    }

    // step 5: save final scores
    await this.finalScoreRepository.saveAll(finalScores);
    this.logger.log('Final scores saved successfully.');

    // step 6: mark games as completed
    await this.gameRepository.saveAll(
      pendingGames.map((game) => ({
        ...game,
        status: 'completed',
      })),
    );
    this.logger.log('Pending games marked as completed.');
    this.logger.log('Tallying final scores completed.');
  }
}
