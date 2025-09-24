import { Controller, Get, Param, Post } from '@nestjs/common';
import { GetDailyResultByGameUseCase } from './use-cases/get.daily.result.by.game.use.case';
import { TriggerEndOfDayResultUseCase } from './use-cases/trigger.end.of.day.result.use.case';

@Controller('daily-results')
export class DailyResultController {
  constructor(
    private readonly getDailyResultByGameUseCase: GetDailyResultByGameUseCase,
    private readonly triggerEndOfDayResultUseCase: TriggerEndOfDayResultUseCase,
  ) {}

  @Get(':gameId')
  async getDailyResultsByGameId(@Param('gameId') gameId: string) {
    return this.getDailyResultByGameUseCase.execute(gameId);
  }

  @Post(':gameId/trigger-end-of-day')
  async triggerEndOfDayResult(@Param('gameId') gameId: string) {
    return this.triggerEndOfDayResultUseCase.execute(gameId);
  }
}
