import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Professor } from '../../professors/entities/professor.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'ratings' })
@Unique(['professor', 'student'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => Professor, (professor) => professor.ratings, { onDelete: 'CASCADE' })
  professor!: Professor;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  student!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
