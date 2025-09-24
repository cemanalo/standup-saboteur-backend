import { Inject } from '@nestjs/common';
import { PairingRequestEntity } from '../pairing.request.entity';
import {
  PAIRING_REQUEST_REPOSITORY,
  type PairingRequestRepository,
} from '../../pairing/pairing.request.repository';

export class GetPlayerPairingRequestTodayUseCase {
  constructor(
    @Inject(PAIRING_REQUEST_REPOSITORY)
    private pairingRequestRepo: PairingRequestRepository,
  ) {}

  async execute(playerId: string): Promise<PairingRequestEntity[]> {
    if (!playerId) {
      throw new Error('Invalid playerId');
    }

    return this.pairingRequestRepo.getAllPairingRequestsByPlayerIdToday(
      playerId,
    );
  }
}
