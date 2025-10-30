import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { University } from '../../universities/entities/university.entity';

@Entity({ name: 'professors' })
export class Professor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  department!: string;

  @Column({ name: 'university_id' })
  universityId!: string;

  @ManyToOne(() => University, (university) => university.professors)
  @JoinColumn({ name: 'university_id' })
  university!: University;

  @OneToMany(() => Comment, (comment) => comment.professor)
  comments!: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
