import { Controller, Get, Logger, Query } from '@nestjs/common';
import { GetPairingsByPlayerAndGameUseCase } from './use-cases/get.pairings.by.player.and.game.use.case';

@Controller('pairings')
export class PairingController {
  constructor(
    private readonly logger: Logger,
    private readonly getPairingsByPlayerAndGameUseCase: GetPairingsByPlayerAndGameUseCase,
  ) {}
  @Get()
  getAllPairings(
    @Query('playerId') playerId: string,
    @Query('gameId') gameId: string,
  ) {
    this.logger.log('Params:', { playerId, gameId });
    if (playerId && gameId) {
      return this.getPairingsByPlayerAndGameUseCase.execute({
        playerId,
        gameId,
      });
    }
  }
}
