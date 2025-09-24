import { Inject } from '@nestjs/common';
import {
  PAIRING_REQUEST_REPOSITORY,
  type PairingRequestRepository,
} from '../../pairing/pairing.request.repository';
import {
  PAIRING_REPOSITORY,
  type PairingRepository,
} from '../../pairing/pairing.repository';
import { GameGateway } from 'src/game/game.gateway';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';

export type CreatePairingRequestInput = {
  gameId: string;
  fromPlayerId: string;
  toPlayerId: string;
};

export class CreatePairingRequestUseCase {
  constructor(
    @Inject(PAIRING_REQUEST_REPOSITORY)
    private readonly pairingRequestRepo: PairingRequestRepository,
    @Inject(PAIRING_REPOSITORY)
    private readonly pairingRepo: PairingRepository,
    private readonly gameGateway: GameGateway,
    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepo: PlayerRepository,
  ) {}

  async execute(input: CreatePairingRequestInput): Promise<void> {
    const { gameId, fromPlayerId, toPlayerId } = input;

    // step 1: validate input
    if (!gameId || !fromPlayerId || !toPlayerId) {
      throw new Error('Invalid input');
    }

    // TODO: check if gameId, fromPlayerId, toPlayerId exist in their respective tables

    // step 2: check if fromPlayerId has reached the limit of 3 pairings today
    const pairedToday =
      await this.pairingRepo.getPairingsForPlayerToday(fromPlayerId);
    if (pairedToday.length >= 3) {
      throw new Error('Player has reached the limit of 3 pairings today');
    }

    // step 3: check if there are existing pending requests today
    const existingRequests =
      await this.pairingRequestRepo.getPendingRequestsForPlayerToday(
        fromPlayerId,
        toPlayerId,
      );

    if (existingRequests.length > 0) {
      throw new Error('There are existing pending requests');
    }

    // step 3: create the pairing request
    const pairingRequest = await this.pairingRequestRepo.createPairingRequest(
      gameId,
      fromPlayerId,
      toPlayerId,
    );

    // step 4: notify receiver of the request via socket
    const toPlayer = await this.playerRepo.findById(toPlayerId);

    if (toPlayer) {
      this.gameGateway.notifyPairingRequest(toPlayer.socketId, pairingRequest);
    }
  }
}
