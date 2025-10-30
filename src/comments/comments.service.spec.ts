import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: jest.Mocked<Repository<Comment>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Comment>>;

  const mockRepository = (): jest.Mocked<Repository<Comment>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Comment>>;

  const mockQueryBuilder = (): jest.Mocked<SelectQueryBuilder<Comment>> => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  }) as unknown as jest.Mocked<SelectQueryBuilder<Comment>>;

  beforeEach(() => {
    repository = mockRepository();
    queryBuilder = mockQueryBuilder();
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    service = new CommentsService(repository);
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Great professor!',
        rating: 5,
        professor: 'prof-id-1',
      };
      const studentId = 'student-id-1';

      const comment = {
        id: '1',
        content: dto.content,
        rating: dto.rating,
        professorId: dto.professor,
        studentId,
      } as Comment;

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(comment);
      repository.save.mockResolvedValue(comment);

      const result = await service.create(dto, studentId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          professorId: dto.professor,
          studentId,
        },
      });
      expect(repository.create).toHaveBeenCalledWith({
        content: dto.content,
        rating: dto.rating,
        professorId: dto.professor,
        studentId,
      });
      expect(result).toEqual(comment);
    });

    it('should throw ConflictException when student already commented on professor', async () => {
      const dto: CreateCommentDto = {
        content: 'Great professor!',
        rating: 5,
        professor: 'prof-id-1',
      };
      const studentId = 'student-id-1';

      repository.findOne.mockResolvedValue({
        id: '1',
        professorId: dto.professor,
        studentId,
      } as Comment);

      await expect(service.create(dto, studentId)).rejects.toThrow(ConflictException);
      await expect(service.create(dto, studentId)).rejects.toThrow(
        'Ya has comentado a este profesor. Puedes editar tu comentario existente.',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const comments = [
        { id: '1', content: 'Great!', rating: 5 },
        { id: '2', content: 'Good', rating: 4 },
      ] as Comment[];

      queryBuilder.getCount.mockResolvedValue(2);
      queryBuilder.getMany.mockResolvedValue(comments);

      const result = await service.findAll();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('comment');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('comment.student', 'student');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('comment.professor', 'professor');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('professor.university', 'university');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('comment.createdAt', 'DESC');
      expect(result).toEqual({
        data: comments,
        page: 1,
        limit: 20,
        total: 2,
      });
    });

    it('should filter by professorId', async () => {
      const comments = [{ id: '1', content: 'Great!', professorId: 'prof-1' }] as Comment[];

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(comments);

      await service.findAll('prof-1');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.professorId = :professorId', {
        professorId: 'prof-1',
      });
    });

    it('should filter by userId', async () => {
      const comments = [{ id: '1', content: 'Great!', studentId: 'user-1' }] as Comment[];

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(comments);

      await service.findAll(undefined, 'user-1');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.studentId = :userId', {
        userId: 'user-1',
      });
    });

    it('should filter by search term', async () => {
      const comments = [{ id: '1', content: 'Great professor!' }] as Comment[];

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(comments);

      await service.findAll(undefined, undefined, 'Great');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.content ILIKE :search', {
        search: '%Great%',
      });
    });

    it('should support pagination', async () => {
      const comments = [{ id: '1', content: 'Great!' }] as Comment[];

      queryBuilder.getCount.mockResolvedValue(100);
      queryBuilder.getMany.mockResolvedValue(comments);

      const result = await service.findAll(undefined, undefined, undefined, 2, 10);

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const comment = { id: '1', content: 'Great!' } as Comment;
      repository.findOne.mockResolvedValue(comment);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['student', 'professor', 'professor.university'],
      });
      expect(result).toEqual(comment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('Comment with ID "999" not found');
    });
  });

  describe('update', () => {
    it('should update comment as owner', async () => {
      const comment = {
        id: '1',
        content: 'Original content',
        rating: 3,
        studentId: 'user-1',
      } as Comment;

      const dto: UpdateCommentDto = {
        content: 'Updated content',
        rating: 5,
      };

      const updatedComment = {
        ...comment,
        content: 'Updated content',
        rating: 5,
      } as Comment;

      repository.findOne.mockResolvedValue(comment);
      repository.save.mockResolvedValue(updatedComment);

      const result = await service.update('1', dto, 'user-1', 'student');

      expect(result.content).toBe('Updated content');
      expect(result.rating).toBe(5);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update comment as admin', async () => {
      const comment = {
        id: '1',
        content: 'Original content',
        studentId: 'user-1',
      } as Comment;

      const dto: UpdateCommentDto = {
        content: 'Moderated content',
      };

      const updatedComment = {
        ...comment,
        content: 'Moderated content',
      } as Comment;

      repository.findOne.mockResolvedValue(comment);
      repository.save.mockResolvedValue(updatedComment);

      const result = await service.update('1', dto, 'admin-id', 'admin');

      expect(result.content).toBe('Moderated content');
    });

    it('should throw UnauthorizedException when user is not owner or admin', async () => {
      const comment = {
        id: '1',
        content: 'Original content',
        studentId: 'user-1',
      } as Comment;

      repository.findOne.mockResolvedValue(comment);

      await expect(service.update('1', { content: 'Hack' }, 'user-2', 'student')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.update('1', { content: 'Hack' }, 'user-2', 'student')).rejects.toThrow(
        'Solo puedes editar tus propios comentarios',
      );
    });

    it('should only update provided fields', async () => {
      const comment = {
        id: '1',
        content: 'Original content',
        rating: 3,
        studentId: 'user-1',
      } as Comment;

      const dto: UpdateCommentDto = {
        rating: 5,
      };

      const updatedComment = {
        ...comment,
        rating: 5,
      } as Comment;

      repository.findOne.mockResolvedValue(comment);
      repository.save.mockResolvedValue(updatedComment);

      const result = await service.update('1', dto, 'user-1', 'student');

      expect(result.content).toBe('Original content');
      expect(result.rating).toBe(5);
    });
  });

  describe('remove', () => {
    it('should remove comment as owner', async () => {
      const comment = {
        id: '1',
        studentId: 'user-1',
      } as Comment;

      repository.findOne.mockResolvedValue(comment);
      repository.remove.mockResolvedValue(comment);

      await service.remove('1', 'user-1', 'student');

      expect(repository.remove).toHaveBeenCalledWith(comment);
    });

    it('should remove comment as admin', async () => {
      const comment = {
        id: '1',
        studentId: 'user-1',
      } as Comment;

      repository.findOne.mockResolvedValue(comment);
      repository.remove.mockResolvedValue(comment);

      await service.remove('1', 'admin-id', 'admin');

      expect(repository.remove).toHaveBeenCalledWith(comment);
    });

    it('should throw UnauthorizedException when user is not owner or admin', async () => {
      const comment = {
        id: '1',
        studentId: 'user-1',
      } as Comment;

      repository.findOne.mockResolvedValue(comment);

      await expect(service.remove('1', 'user-2', 'student')).rejects.toThrow(UnauthorizedException);
      await expect(service.remove('1', 'user-2', 'student')).rejects.toThrow(
        'Solo puedes eliminar tus propios comentarios',
      );
    });
  });

  describe('getProfessorAverageRating', () => {
    it('should return average rating and count', async () => {
      queryBuilder.getRawOne.mockResolvedValue({
        average: '4.5',
        count: '10',
      });

      const result = await service.getProfessorAverageRating('prof-1');

      expect(queryBuilder.select).toHaveBeenCalledWith('AVG(comment.rating)', 'average');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('COUNT(comment.rating)', 'count');
      expect(queryBuilder.where).toHaveBeenCalledWith('comment.professorId = :professorId', {
        professorId: 'prof-1',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.rating IS NOT NULL');
      expect(result).toEqual({
        average: 4.5,
        count: 10,
      });
    });

    it('should return zero when no ratings found', async () => {
      queryBuilder.getRawOne.mockResolvedValue({
        average: null,
        count: '0',
      });

      const result = await service.getProfessorAverageRating('prof-1');

      expect(result).toEqual({
        average: 0,
        count: 0,
      });
    });
  });
});
