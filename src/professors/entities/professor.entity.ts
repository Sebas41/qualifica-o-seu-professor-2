import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity({ name: 'professors' })
export class Professor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column()
  department!: string;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => Rating, (rating) => rating.professor)
  ratings!: Rating[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
