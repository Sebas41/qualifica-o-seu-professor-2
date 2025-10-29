import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Professor } from '../../professors/entities/professor.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ 
    type: 'int', 
    nullable: true, 
    comment: 'Rating from 1 to 5 (optional)' 
  })
  rating?: number;

  @Column({ name: 'professor_id' })
  professorId!: string;

  @Column({ name: 'student_id' })
  studentId!: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @ManyToOne(() => Professor, (professor) => professor.comments)
  @JoinColumn({ name: 'professor_id' })
  professor!: Professor;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
