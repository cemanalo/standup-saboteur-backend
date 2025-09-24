import { InjectRepository } from '@nestjs/typeorm';
import { PairingRequestEntity } from '../pairing-request/pairing.request.entity';
import { Between, Repository } from 'typeorm';

export const PAIRING_REQUEST_REPOSITORY = Symbol('PAIRING_REQUEST_REPOSITORY');

export interface PairingRequestRepository {
  /**
   * Get all pending pairing requests for a player today.
   * @param senderId The ID of the player sending the request.
   * @param receiverId The ID of the player receiving the request.
   */
  getPendingRequestsForPlayerToday(
    senderId: string,
    receiverId: string,
  ): Promise<PairingRequestEntity[]>;

  /**
   * Create a new pairing request.
   * @param gameId The ID of the game.
   * @param fromPlayerId The ID of the player sending the request.
   * @param toPlayerId The ID of the player receiving the request.
   */
  createPairingRequest(
    gameId: string,
    fromPlayerId: string,
    toPlayerId: string,
  ): Promise<PairingRequestEntity>;

  /**
   * Get all pairing requests (regardless of status) involving a player today.
   * @param playerId The ID of the player.
   * @returns All pairing requests (regardless of status) involving the player today.
   */
  getAllPairingRequestsByPlayerIdToday(
    playerId: string,
  ): Promise<PairingRequestEntity[]>;

  /**
   * Find a pairing request by its ID.
   *
   * @param id The ID of the pairing request.
   * @returns The pairing request entity or null if not found.
   */
  findOneById(id: string): Promise<PairingRequestEntity | null>;

  /**
   * Update a pairing request.
   * @param id The ID of the pairing request.
   * @param updateData The data to update.
   * @returns The updated pairing request entity or null if not found.
   */
  updatePairingRequest(
    id: string,
    updateData: Partial<PairingRequestEntity>,
  ): Promise<PairingRequestEntity | null>;
}

export class PairingRequestRepositoryImpl implements PairingRequestRepository {
  constructor(
    @InjectRepository(PairingRequestEntity) // specify entity if needed
    private readonly repo: Repository<PairingRequestEntity>, // replace 'any' with actual entity
  ) {}

  getPendingRequestsForPlayerToday(
    senderId: string,
    receiverId: string,
  ): Promise<PairingRequestEntity[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.repo.find({
      where: [
        {
          fromPlayerId: senderId,
          toPlayerId: receiverId,
          status: 'pending',
          createdAt: Between(startOfDay, endOfDay),
        },
        {
          fromPlayerId: receiverId,
          toPlayerId: senderId,
          status: 'pending',
          createdAt: Between(startOfDay, endOfDay),
        },
      ],
    });
  }

  async createPairingRequest(
    gameId: string,
    fromPlayerId: string,
    toPlayerId: string,
  ): Promise<PairingRequestEntity> {
    const pairingRequest = this.repo.create({
      gameId,
      fromPlayerId,
      toPlayerId,
      status: 'pending',
    });
    return await this.repo.save(pairingRequest);
  }

  getAllPairingRequestsByPlayerIdToday(
    playerId: string,
  ): Promise<PairingRequestEntity[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.repo.find({
      where: [
        { fromPlayerId: playerId, createdAt: Between(startOfDay, endOfDay) },
        { toPlayerId: playerId, createdAt: Between(startOfDay, endOfDay) },
      ],
    });
  }

  findOneById(id: string): Promise<PairingRequestEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async updatePairingRequest(
    id: string,
    updateData: Partial<PairingRequestEntity>,
  ): Promise<PairingRequestEntity | null> {
    const pairingRequest = await this.repo.findOneBy({ id });
    if (!pairingRequest) {
      return null;
    }
    Object.assign(pairingRequest, updateData);
    return this.repo.save(pairingRequest);
  }
}
