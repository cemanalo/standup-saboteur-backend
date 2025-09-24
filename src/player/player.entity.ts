import { GameEntity } from 'src/game/game.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('players')
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  pin: string;

  @Column()
  avatarSeed: string;

  @Column({
    nullable: true,
  })
  gameId: string;

  @Column({
    type: 'text',
    default: 'contributor',
  })
  role: 'contributor' | 'blocker';

  @Column({ type: 'boolean', default: false })
  isReady: boolean;

  @Column({
    nullable: true,
  })
  socketId!: string;

  @Column({
    type: 'integer',
    default: 0,
  })
  score: number;

  @Column({ nullable: true })
  funnyName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => GameEntity, (game) => game.players)
  @JoinColumn({ name: 'gameId' }) // optional, but good for clarity
  game: GameEntity;
}
