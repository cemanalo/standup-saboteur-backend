import { PlayerEntity } from 'src/player/player.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('games')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column({ unique: true, length: 6 })
  roomCode: string;

  @Column({
    type: 'text',
    default: 'waiting',
  })
  status: 'waiting' | 'in_progress' | 'completed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // @Column({ default: 'classic'})
  // mode: 'classic' | 'timed';

  // @Column({nullable: true})
  // endTime: Date

  @OneToMany(() => PlayerEntity, (player) => player.game)
  players: PlayerEntity[];
}
