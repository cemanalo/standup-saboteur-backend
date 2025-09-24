import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  CreatePairingRequestDto,
  RespondToPairingRequestDto,
} from './pairing.request.dto';
import { CreatePairingRequestUseCase } from './use-cases/create.pairing.request.use.case';
import { GetPlayerPairingRequestTodayUseCase } from './use-cases/get.player.pairing.request.today.use.case';
import { RespondToPairingRequestUseCase } from './use-cases';

@Controller('pairing-requests')
export class PairingRequestController {
  constructor(
    private readonly createPairingRequestUseCase: CreatePairingRequestUseCase,
    private readonly getPlayerPairingRequestTodayUseCase: GetPlayerPairingRequestTodayUseCase,
    private readonly respondToPairingRequestUseCase: RespondToPairingRequestUseCase,
  ) {}

  @Post()
  async createPairingRequest(@Body() body: CreatePairingRequestDto) {
    await this.createPairingRequestUseCase.execute(body);
    return { message: 'Pairing request created' };
  }

  @Get('today/:playerId')
  async getPlayerPairingRequestToday(@Param('playerId') playerId: string) {
    const requests =
      await this.getPlayerPairingRequestTodayUseCase.execute(playerId);
    return requests;
  }

  @Post('respond')
  async respondToPairingRequest(@Body() body: RespondToPairingRequestDto) {
    await this.respondToPairingRequestUseCase.execute(body);
    return { message: 'Pairing request response recorded' };
  }
}
