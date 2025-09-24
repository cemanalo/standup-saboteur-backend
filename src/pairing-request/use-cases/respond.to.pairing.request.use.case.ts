import { GameGateway } from 'src/game/game.gateway';
import {
  PAIRING_REQUEST_REPOSITORY,
  type PairingRequestRepository,
} from '../../pairing/pairing.request.repository';
import { Inject, Logger } from '@nestjs/common';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from 'src/player/player.repository';
import { PlayerEntity } from 'src/player/player.entity';
import { PairingRequestEntity } from '../pairing.request.entity';
import {
  PAIRING_REPOSITORY,
  type PairingRepository,
} from '../../pairing/pairing.repository';
import { PairingEntity } from '../../pairing/pairing.entity';

export type RespondToPairingRequestInput = {
  requestId: string;
  response: 'accepted' | 'rejected';
  gameId: string;
  fromPlayerId: string;
  toPlayerId: string;
};

export class RespondToPairingRequestUseCase {
  constructor(
    private readonly logger: Logger,
    @Inject(PAIRING_REQUEST_REPOSITORY)
    private pairingRequestRepo: PairingRequestRepository,
    @Inject(PLAYER_REPOSITORY)
    private playerRepo: PlayerRepository,
    @Inject(PAIRING_REPOSITORY)
    private pairingRepo: PairingRepository,
    private gameGateway: GameGateway,
  ) {}

  async execute(input: RespondToPairingRequestInput): Promise<void> {
    const { requestId, response, gameId, fromPlayerId, toPlayerId } = input;

    // step 1: update pairing request status
    const pairingRequest = await this.pairingRequestRepo.findOneById(requestId);

    if (!pairingRequest) {
      throw new Error('Pairing request not found');
    }

    // step 1: validate if the request matches the input
    if (
      pairingRequest.fromPlayerId !== fromPlayerId ||
      pairingRequest.toPlayerId !== toPlayerId ||
      pairingRequest.gameId !== gameId
    ) {
      this.logger.log(
        `Pairing request does not match the input data -> input: ${JSON.stringify(input)} | database: ${JSON.stringify(pairingRequest)}`,
      );
      throw new Error('Pairing request does not match the input data');
    }

    // step 2: validate if the request is still pending
    if (pairingRequest.status !== 'pending') {
      throw new Error('Pairing request is not pending');
    }

    pairingRequest.status = response;
    await this.pairingRequestRepo.updatePairingRequest(
      requestId,
      pairingRequest,
    );

    // step 3: notify the sender about the response via socket
    const fromPlayer = await this.playerRepo.findById(fromPlayerId);
    const toPlayer = await this.playerRepo.findById(toPlayerId);

    if (!fromPlayer || !toPlayer) {
      throw new Error('Player socket IDs not found');
    }

    // step 4: emit to both players
    this.gameGateway.notifyPairingResponse(
      fromPlayer.socketId,
      toPlayer.socketId,
      requestId,
      response,
    );

    this.logger.log(`Pairing request ${requestId} has been ${response}`);

    // step 5: if accepted, apply game logic
    if (response === 'accepted') {
      await this.pairingAccepted(pairingRequest, fromPlayer, toPlayer);
    }
  }

  async pairingAccepted(
    pairingRequest: PairingRequestEntity,
    fromPlayer: PlayerEntity,
    toPlayer: PlayerEntity,
  ): Promise<void> {
    const result = `${fromPlayer.role}+${toPlayer.role}`;

    // step 1: save the pairing
    const pairing = new PairingEntity();
    Object.assign(pairing, {
      gameId: pairingRequest.gameId,
      player1Id: fromPlayer.id,
      player2Id: toPlayer.id,
      result,
    });

    await this.pairingRepo.createPairing(pairing);
    this.logger.log(`Pairing saved: ${JSON.stringify(pairing)}`);

    // step 2: update scores and roles based on the result
    await this.updateScores(fromPlayer, toPlayer, result);
    this.logger.log(
      `Scores updated: ${fromPlayer.name} (${fromPlayer.score}, ${fromPlayer.role}), ${toPlayer.name} (${toPlayer.score}, ${toPlayer.role})`,
    );
  }

  async updateScores(
    fromPlayer: PlayerEntity,
    toPlayer: PlayerEntity,
    result: string,
  ): Promise<void> {
    if (result === 'blocker+blocker') {
      // No score change
      return;
    }

    if (result === 'contributor+contributor') {
      fromPlayer.score += 1;
      toPlayer.score += 1;
    } else if (result === 'contributor+blocker') {
      fromPlayer.score = 0;
      fromPlayer.role = 'blocker';
      toPlayer.score = 0;
      toPlayer.role = 'contributor';
    } else if (result === 'blocker+contributor') {
      fromPlayer.score = 0;
      fromPlayer.role = 'contributor';
      toPlayer.score = 0;
      toPlayer.role = 'blocker';
    } else {
      this.logger.log(`Unknown pairing result: ${result}`);
      return;
    }

    await this.playerRepo.save(fromPlayer);
    await this.playerRepo.save(toPlayer);
  }
}
