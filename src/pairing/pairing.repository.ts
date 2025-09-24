import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PairingEntity } from './pairing.entity';

export const PAIRING_REPOSITORY = Symbol('PAIRING_REPOSITORY');

export interface PairingRepository {
  getPairingsForPlayerToday(playerId: string): Promise<PairingEntity[]>;
  createPairing(pairing: PairingEntity): Promise<PairingEntity>;
  getPairingsByPlayerIdAndGameId(
    playerId: string,
    gameId: string,
  ): Promise<PairingEntity[]>;
}

export class PairingRepositoryImpl implements PairingRepository {
  constructor(
    @InjectRepository(PairingEntity)
    private readonly repo: Repository<PairingEntity>,
  ) {}

  getPairingsForPlayerToday(playerId: string): Promise<PairingEntity[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.repo.find({
      where: [
        { player1Id: playerId, createdAt: Between(startOfDay, endOfDay) },
        { player2Id: playerId, createdAt: Between(startOfDay, endOfDay) },
      ],
    });
  }

  createPairing(pairing: PairingEntity): Promise<PairingEntity> {
    return this.repo.save(pairing);
  }

  getPairingsByPlayerIdAndGameId(
    playerId: string,
    gameId: string,
  ): Promise<PairingEntity[]> {
    return this.repo.find({
      where: [
        { player1Id: playerId, gameId },
        { player2Id: playerId, gameId },
      ],
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
