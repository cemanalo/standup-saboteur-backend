import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { Repository } from 'typeorm';

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');

export interface GameRepository {
  save(game: GameEntity): Promise<GameEntity>;
  findByCode(roomCode: string): Promise<GameEntity | null>;
  update(id: string, updateData: Partial<GameEntity>): Promise<void>;
  getPendingGames(): Promise<GameEntity[]>;
  saveAll(games: GameEntity[]): Promise<GameEntity[]>;
  findById(id: string): Promise<GameEntity | null>;
}

export class GameRepositoryImpl implements GameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repo: Repository<GameEntity>,
  ) {}

  save(game: GameEntity): Promise<GameEntity> {
    const entity = this.repo.create(game);
    return this.repo.save(entity);
  }

  async findByCode(roomCode: string): Promise<GameEntity | null> {
    return this.repo.findOne({ where: { roomCode }, relations: ['players'] });
  }

  async update(id: string, updateData: Partial<GameEntity>): Promise<void> {
    await this.repo.update({ id }, updateData);
  }

  async getPendingGames(): Promise<GameEntity[]> {
    return this.repo.find({ where: { status: 'in_progress' } });
  }

  async saveAll(games: GameEntity[]): Promise<GameEntity[]> {
    const entities = this.repo.create(games);
    return this.repo.save(entities);
  }

  async findById(id: string): Promise<GameEntity | null> {
    return this.repo.findOneBy({ id });
  }
}
