import { Controller, Get, Param, Post } from '@nestjs/common';
import { TallyFinalScoreUseCase } from './use-cases/tally.final.score.use.case';
import { FinalScoreEntity } from './final.score.entity';
import { GetFinalScoreByGameUseCase } from './use-cases/get.final.score.by.game.use.case';

@Controller('final-scores')
export class FinalScoreController {
  constructor(
    private readonly tallyFinalScoreUseCase: TallyFinalScoreUseCase,
    private readonly getFinalScoresByGameUseCase: GetFinalScoreByGameUseCase,
  ) {}

  @Post('tally')
  async tallyFinalScores(): Promise<void> {
    await this.tallyFinalScoreUseCase.execute();
  }

  @Get('get-by-game/:gameId')
  async getFinalScoresByGame(
    @Param('gameId') gameId: string,
  ): Promise<FinalScoreEntity[]> {
    return this.getFinalScoresByGameUseCase.execute(gameId);
  }
}
