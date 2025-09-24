import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GAME_REPOSITORY, type GameRepository } from 'src/game/game.repository';
import { TriggerEndOfDayResultUseCase } from './use-cases';

@Injectable()
export class DailyResultTask {
  constructor(
    private readonly logger: Logger,
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    private readonly triggerEndOfDayResultUseCase: TriggerEndOfDayResultUseCase,
  ) {}

  // runs every day at 11:53 PM
  @Cron('53 23 * * *')
  async handleCron() {
    this.logger.log('Running daily result task at 11:53 PM');
    // get all in_progress games
    const games = await this.gameRepository.getPendingGames();

    await Promise.all(
      games.map(async (game) => {
        this.logger.log(`Triggering end of day result for gameId: ${game.id}`);
        await this.triggerEndOfDayResultUseCase.execute(game.id);
      }),
    );
  }
}
