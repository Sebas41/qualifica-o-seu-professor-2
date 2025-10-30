import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'blacklisted_tokens' })
export class BlacklistedToken {
  @PrimaryColumn()
  jti!: string; // JWT ID - unique identifier for the token

  @Column({ type: 'timestamp' })
  expiresAt!: Date; // Token expiration time

  @CreateDateColumn({ name: 'blacklisted_at' })
  blacklistedAt!: Date;
}

