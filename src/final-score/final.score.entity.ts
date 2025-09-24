import { PlayerEntity } from 'src/player/player.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

@Entity('final_scores')
export class FinalScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  playerId: string;

  @Column({ type: 'integer' })
  totalScore: number;

  @Column({ type: 'date' })
  weekEnding: string; // YYYY-MM-DD (end of the week)

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => PlayerEntity)
  @JoinColumn({ name: 'playerId' })
  player: PlayerEntity;
}
