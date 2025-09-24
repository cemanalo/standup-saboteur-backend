import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * This represents the actual established pair (once a request is accepted).
 */
@Entity('pairings')
export class PairingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  player1Id: string;

  @Column()
  player2Id: string;

  @Column()
  result: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
