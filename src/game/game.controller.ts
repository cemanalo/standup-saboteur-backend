import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CreateGameUseCase } from './use-cases/create.game.use.case';
import {
  CreateGameDto,
  JoinGameDto,
  KickPlayerDto,
  StartGameDto,
} from './game.dto';
import { GetGameUseCase } from './use-cases/get.game.use.case';
import { JoinGameUseCase } from './use-cases/join.game.use.case';
import { StartGameUseCase } from './use-cases/start.game.use.case';
import { KickPlayerUseCase } from './use-cases/kick.player.use.case';

@Controller('games')
export class GameController {
  constructor(
    private readonly logger: Logger,
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly getGameUseCase: GetGameUseCase,
    private readonly joinGameUseCase: JoinGameUseCase,
    private readonly startGameUseCase: StartGameUseCase,
    private readonly kickPlayerUseCase: KickPlayerUseCase,
  ) {}

  @Post()
  async create(@Body() createGameDto: CreateGameDto) {
    const socketId = 'ABCDEF'; // TODO: temporary placeholder
    return this.createGameUseCase.execute({
      ...createGameDto,
      ownerSocketId: socketId,
    });
  }

  @Get(':roomCode')
  async findByCode(@Param('roomCode') roomCode: string) {
    this.logger.log('Finding game by room code:', roomCode);
    return await this.getGameUseCase.execute({ roomCode });
  }

  @Post(':roomCode/join')
  async join(
    @Param('roomCode') roomCode: string,
    @Body() joinGameDto: JoinGameDto,
  ) {
    return await this.joinGameUseCase.execute({ roomCode, ...joinGameDto });
  }

  @Post(':roomCode/start')
  async start(
    @Param('roomCode') roomCode: string,
    @Body() startGameDto: StartGameDto,
  ) {
    return await this.startGameUseCase.execute({ roomCode, ...startGameDto });
  }

  @Post(':roomCode/kick')
  async kick(
    @Param('roomCode') roomCode: string,
    @Body() kickPlayerDto: KickPlayerDto,
  ) {
    return await this.kickPlayerUseCase.execute({
      ...kickPlayerDto,
      roomCode,
    });
  }
}
