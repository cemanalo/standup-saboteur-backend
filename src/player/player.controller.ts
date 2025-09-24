import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePlayerDto } from './player.dto';
import { CreatePlayerUseCase } from './use-cases/create.player.use.case';
import { GetPlayerUseCase } from './use-cases/get.player.use.case';

@Controller('games/:gameId/players')
export class PlayerController {
  constructor(
    private readonly createPlayerUseCase: CreatePlayerUseCase,
    private readonly getPlayerUseCase: GetPlayerUseCase,
  ) {}

  @Post()
  async createPlayer(
    @Param('gameId') gameId: string,
    @Body() createPlayerDto: CreatePlayerDto,
  ) {
    const socketId = 'GHIJKL'; // TODO: temporary placeholder
    return this.createPlayerUseCase.execute({
      ...createPlayerDto,
      gameId,
      socketId,
    });
  }

  @Get(':playerId')
  async getPlayer(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
  ) {
    return await this.getPlayerUseCase.execute({ gameId, playerId });
  }
}
