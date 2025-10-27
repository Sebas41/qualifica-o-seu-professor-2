import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { Professor } from '../professors/entities/professor.entity';
import { User } from '../users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from './entities/rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
    @InjectRepository(Professor)
    private readonly professorsRepository: Repository<Professor>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createRatingDto: CreateRatingDto, studentId: string): Promise<Rating> {
    const professor = await this.professorsRepository.findOne({ where: { id: createRatingDto.professorId } });
    if (!professor) {
      throw new NotFoundException('Professor not found');
    }

    const student = await this.usersRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const existing = await this.ratingsRepository.findOne({
      where: {
        professor: { id: professor.id },
        student: { id: student.id },
      },
      relations: ['professor', 'student'],
    });

    if (existing) {
      throw new ForbiddenException('You have already rated this professor');
    }

    const rating = this.ratingsRepository.create({
      score: createRatingDto.score,
      comment: createRatingDto.comment,
      professor,
      student,
    });

    return this.ratingsRepository.save(rating);
  }

  findAll(): Promise<Rating[]> {
    return this.ratingsRepository.find({ relations: ['professor', 'student'] });
  }

  async findByProfessor(professorId: string): Promise<Rating[]> {
    return this.ratingsRepository.find({
      where: { professor: { id: professorId } },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateRatingDto: UpdateRatingDto,
    requester: { id: string; role: UserRole },
  ): Promise<Rating> {
    const rating = await this.ratingsRepository.findOne({
      where: { id },
      relations: ['student', 'professor'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (requester.role !== UserRole.ADMIN && rating.student.id !== requester.id) {
      throw new ForbiddenException('You can only modify your own ratings');
    }

    if (updateRatingDto.professorId && updateRatingDto.professorId !== rating.professor.id) {
      const professor = await this.professorsRepository.findOne({ where: { id: updateRatingDto.professorId } });
      if (!professor) {
        throw new NotFoundException('Professor not found');
      }
      rating.professor = professor;
    }

    if (typeof updateRatingDto.score === 'number') {
      rating.score = updateRatingDto.score;
    }

    if (typeof updateRatingDto.comment !== 'undefined') {
      rating.comment = updateRatingDto.comment;
    }

    return this.ratingsRepository.save(rating);
  }

  async remove(id: string, requester: { id: string; role: UserRole }): Promise<void> {
    const rating = await this.ratingsRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (requester.role !== UserRole.ADMIN && rating.student.id !== requester.id) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.ratingsRepository.remove(rating);
  }
}
