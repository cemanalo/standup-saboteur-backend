import { Inject } from '@nestjs/common';
import {
  PAIRING_REPOSITORY,
  type PairingRepository,
} from '../pairing.repository';
import { type PairingEntity } from '../pairing.entity';
import {
  PLAYER_REPOSITORY,
  type PlayerRepository,
} from '../../player/player.repository';

export type GetPairingsByPlayerAndGameInput = {
  playerId: string;
  gameId: string;
};

export type GetPairingsByPlayerAndGameOutput = Array<
  Omit<PairingEntity, 'result'> & {
    partnerName?: string;
    partnerAvatarSeed?: string;
  }
>;

export class GetPairingsByPlayerAndGameUseCase {
  constructor(
    @Inject(PAIRING_REPOSITORY)
    private readonly pairingRepo: PairingRepository,

    @Inject(PLAYER_REPOSITORY)
    private readonly playerRepo: PlayerRepository,
  ) {}

  async execute(
    input: GetPairingsByPlayerAndGameInput,
  ): Promise<GetPairingsByPlayerAndGameOutput> {
    const { playerId, gameId } = input;
    // step 1: fetch pairings by playerId and gameId
    const pairings = await this.pairingRepo.getPairingsByPlayerIdAndGameId(
      playerId,
      gameId,
    );

    // step 2: Extract partnerIds (the other side of the pair)
    const partnerIds = pairings.map((p: PairingEntity) =>
      p.player1Id === playerId ? p.player2Id : p.player1Id,
    );

    // step 3: Fetch partner details
    const partners = await this.playerRepo.findByIds(partnerIds);

    return pairings.map((pairing) => {
      const partnerId =
        pairing.player1Id === playerId ? pairing.player2Id : pairing.player1Id;
      const partner = partners.find((p) => p.id === partnerId);
      // mask result and partner's role
      pairing.result = '*****';
      return {
        ...pairing,
        partnerName: partner?.name || 'Unknown',
        partnerAvatarSeed: partner?.avatarSeed || 'Unknown',
      };
    });
  }
}
