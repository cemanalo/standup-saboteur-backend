import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * This represents the "intent or proposal" by one player to pair with another.
 */
@Entity('pairing_requests')
export class PairingRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  fromPlayerId: string;

  @Column()
  toPlayerId: string;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
