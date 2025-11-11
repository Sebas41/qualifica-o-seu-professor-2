import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, studentId: string): Promise<Comment> {
    // Verificar que el estudiante no haya comentado ya a este profesor
    const existingComment = await this.commentRepository.findOne({
      where: {
        professorId: createCommentDto.professor,
        studentId: studentId,
      },
    });

    if (existingComment) {
      throw new ConflictException('Ya has comentado a este profesor. Puedes editar tu comentario existente.');
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      rating: createCommentDto.rating,
      professorId: createCommentDto.professor,
      studentId: studentId,
    });

    return this.commentRepository.save(comment);
  }

  async findAll(
    professorId?: string,
    userId?: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Comment[]; page: number; limit: number; total: number }> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.student', 'student')
      .leftJoinAndSelect('comment.professor', 'professor')
      .leftJoinAndSelect('professor.university', 'university');

    if (professorId) {
      queryBuilder.andWhere('comment.professorId = :professorId', { professorId });
    }

    if (userId) {
      queryBuilder.andWhere('comment.studentId = :userId', { userId });
    }

    if (search) {
      queryBuilder.andWhere('comment.content ILIKE :search', { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['student', 'professor', 'professor.university'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string, userRole: string): Promise<Comment> {
    const comment = await this.findOne(id);

    // Verificar permisos: solo el dueño o admin puede editar
    if (comment.studentId !== userId && userRole !== 'admin') {
      throw new UnauthorizedException('Solo puedes editar tus propios comentarios');
    }

    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }
    if (updateCommentDto.rating !== undefined) {
      comment.rating = updateCommentDto.rating;
    }

    return this.commentRepository.save(comment);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.findOne(id);

    // Verificar permisos: solo el dueño o admin puede eliminar
    if (comment.studentId !== userId && userRole !== 'admin') {
      throw new UnauthorizedException('Solo puedes eliminar tus propios comentarios');
    }

    await this.commentRepository.remove(comment);
  }

  async getProfessorAverageRating(professorId: string): Promise<{ average: number; count: number }> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'average')
      .addSelect('COUNT(comment.rating)', 'count')
      .where('comment.professorId = :professorId', { professorId })
      .andWhere('comment.rating IS NOT NULL')
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  async findByProfessor(professorId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { professorId },
      relations: ['student', 'professor', 'professor.university'],
      order: { createdAt: 'DESC' },
    });

    return comments;
  }
}
