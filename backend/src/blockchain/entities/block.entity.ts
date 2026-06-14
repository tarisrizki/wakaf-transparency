import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'block_index' })
  blockIndex: number;

  @Column({ name: 'previous_hash', length: 64 })
  previousHash: string;

  @Column({ length: 64 })
  hash: string;

  @Column({ type: 'jsonb' })
  data: object;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  actor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
