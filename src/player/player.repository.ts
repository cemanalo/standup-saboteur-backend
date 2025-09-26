import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from './player.entity';

export const PLAYER_REPOSITORY = Symbol('PLAYER_REPOSITORY');

export interface PlayerRepository {
  save(player: PlayerEntity): Promise<PlayerEntity>;
  updateSocketId(playerId: string, socketId: string): Promise<void>;
  findByGameId(gameId: string): Promise<PlayerEntity[]>;
  toggleReady(playerId: string, isReady: boolean): Promise<PlayerEntity>;
  findByNameAndGameId(
    name: string,
    gameId: string,
  ): Promise<PlayerEntity | null>;
  update(id: string, updateData: Partial<PlayerEntity>): Promise<void>;
  findById(id: string): Promise<PlayerEntity | null>;
  findByIds(ids: string[]): Promise<PlayerEntity[]>;
  findByIdAndGameId(id: string, gameId: string): Promise<PlayerEntity | null>;
  findByNameAndPin(name: string, pin: string): Promise<PlayerEntity | null>;
  deletePlayerById(id: string): Promise<void>
}

export class PlayerRepositoryImpl implements PlayerRepository {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly repo: Repository<PlayerEntity>,
  ) {}

  async save(player: PlayerEntity): Promise<PlayerEntity> {
    // encrypt the pin to base64 before saving
    player.pin = Buffer.from(player.pin.toString()).toString('base64');
    const entity = this.repo.create(player);
    return this.repo.save(entity);
  }
  async updateSocketId(playerId: string, socketId: string): Promise<void> {
    await this.repo.update({ id: playerId }, { socketId });
  }

  async findByGameId(gameId: string): Promise<PlayerEntity[]> {
    return this.repo.find({ where: { gameId } });
  }

  async toggleReady(playerId: string, isReady: boolean): Promise<PlayerEntity> {
    const player = await this.repo.findOneBy({ id: playerId });
    if (!player) {
      throw new Error('Player not found');
    }
    player.isReady = isReady;
    return this.repo.save(player);
  }

  async findByNameAndGameId(
    name: string,
    gameId: string,
  ): Promise<PlayerEntity | null> {
    return this.repo.findOneBy({ name, gameId });
  }

  async update(id: string, updateData: Partial<PlayerEntity>): Promise<void> {
    await this.repo.update({ id }, updateData);
  }

  async findById(id: string): Promise<PlayerEntity | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIds(ids: string[]): Promise<PlayerEntity[]> {
    return this.repo.findByIds(ids);
  }

  async findByIdAndGameId(
    id: string,
    gameId: string,
  ): Promise<PlayerEntity | null> {
    return this.repo.findOneBy({ id, gameId });
  }

  async findByNameAndPin(
    name: string,
    pin: string,
  ): Promise<PlayerEntity | null> {
    return this.repo.findOneBy({ name, pin });
  }

  async deletePlayerById(id: string): Promise<void> {
    await this.repo.delete({ id })
  }
}
