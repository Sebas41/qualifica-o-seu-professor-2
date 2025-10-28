import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'ratings' })
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', comment: 'Rating from 1 to 5' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'professor_id' })
  professorId!: string;

  @Column({ name: 'student_id' })
  studentId!: string;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_id' })
  professor!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
