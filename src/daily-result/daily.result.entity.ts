import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('daily_results')
export class DailyResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  playerId: string;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD format

  @CreateDateColumn()
  createdAt: Date;
}
