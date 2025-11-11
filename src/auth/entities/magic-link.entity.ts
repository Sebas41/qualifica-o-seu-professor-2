import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'magic_links' })
export class MagicLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ name: 'expires_at' })
  expiresAt!: Date;

  @Column({ default: false, name: 'is_used' })
  isUsed!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

