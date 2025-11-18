import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserRole } from '../common/enums/role.enum';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  const mockComment = {
    id: '1',
    content: 'Great professor!',
    rating: 5,
    professorId: 'prof-1',
    studentId: 'student-1',
    professor: {
      id: 'prof-1',
      name: 'Dr. Smith',
      department: 'CS',
      universityId: 'uni-1',
      university: {
        id: 'uni-1',
        name: 'Test University',
        location: 'Test City',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    student: {
      id: 'student-1',
      email: 'student@test.com',
      name: 'Student User',
      role: UserRole.STUDENT,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getProfessorAverageRating: jest.fn(),
    findByProfessor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      const mockResult = {
        data: [mockComment],
        page: 1,
        limit: 20,
        total: 1,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, 1, 20);
    });

    it('should filter by professor', async () => {
      const mockResult = {
        data: [mockComment],
        page: 1,
        limit: 20,
        total: 1,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult as any);

      await controller.findAll('prof-1');

      expect(service.findAll).toHaveBeenCalledWith('prof-1', undefined, undefined, 1, 20);
    });

    it('should filter by user', async () => {
      const mockResult = {
        data: [mockComment],
        page: 1,
        limit: 20,
        total: 1,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult as any);

      await controller.findAll(undefined, 'student-1');

      expect(service.findAll).toHaveBeenCalledWith(undefined, 'student-1', undefined, 1, 20);
    });

    it('should handle pagination parameters', async () => {
      const mockResult = {
        data: [mockComment],
        page: 2,
        limit: 10,
        total: 25,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult as any);

      await controller.findAll(undefined, undefined, undefined, '2', '10');

      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, 2, 10);
    });

    it('should handle search query', async () => {
      const mockResult = {
        data: [mockComment],
        page: 1,
        limit: 20,
        total: 1,
      };

      mockCommentsService.findAll.mockResolvedValue(mockResult as any);

      await controller.findAll(undefined, undefined, 'Great');

      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, 'Great', 1, 20);
    });
  });

  describe('findOne', () => {
    it('should return a single comment', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockComment);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentsService.findOne.mockRejectedValue(
        new NotFoundException('Comment with ID "999" not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createDto: CreateCommentDto = {
        content: 'Excellent teacher!',
        rating: 5,
        professor: 'prof-1',
      };

      const req = { user: { id: 'student-1' } } as any;

      mockCommentsService.create.mockResolvedValue(mockComment as any);

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockComment);
      expect(service.create).toHaveBeenCalledWith(createDto, 'student-1');
    });

    it('should throw ConflictException if student already commented', async () => {
      const createDto: CreateCommentDto = {
        content: 'Another comment',
        rating: 4,
        professor: 'prof-1',
      };

      const req = { user: { id: 'student-1' } } as any;

      mockCommentsService.create.mockRejectedValue(
        new ConflictException('Ya has comentado a este profesor. Puedes editar tu comentario existente.'),
      );

      await expect(controller.create(createDto, req)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a comment by owner', async () => {
      const updateDto: UpdateCommentDto = {
        content: 'Updated comment',
        rating: 4,
      };

      const req = { user: { id: 'student-1', role: UserRole.STUDENT } } as any;

      const updatedComment = { ...mockComment, ...updateDto };
      mockCommentsService.update.mockResolvedValue(updatedComment as any);

      const result = await controller.update('1', updateDto, req);

      expect(result).toEqual(updatedComment);
      expect(service.update).toHaveBeenCalledWith('1', updateDto, 'student-1', UserRole.STUDENT);
    });

    it('should update a comment by admin', async () => {
      const updateDto: UpdateCommentDto = {
        content: 'Admin updated comment',
      };

      const req = { user: { id: 'admin-1', role: UserRole.ADMIN } } as any;

      const updatedComment = { ...mockComment, ...updateDto };
      mockCommentsService.update.mockResolvedValue(updatedComment as any);

      const result = await controller.update('1', updateDto, req);

      expect(result).toEqual(updatedComment);
      expect(service.update).toHaveBeenCalledWith('1', updateDto, 'admin-1', UserRole.ADMIN);
    });

    it('should throw UnauthorizedException if not owner or admin', async () => {
      const updateDto: UpdateCommentDto = {
        content: 'Unauthorized update',
      };

      const req = { user: { id: 'other-student', role: UserRole.STUDENT } } as any;

      mockCommentsService.update.mockRejectedValue(
        new UnauthorizedException('Solo puedes editar tus propios comentarios'),
      );

      await expect(controller.update('1', updateDto, req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment by owner', async () => {
      const req = { user: { id: 'student-1', role: UserRole.STUDENT } } as any;

      mockCommentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', req);

      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('1', 'student-1', UserRole.STUDENT);
    });

    it('should delete a comment by admin', async () => {
      const req = { user: { id: 'admin-1', role: UserRole.ADMIN } } as any;

      mockCommentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', req);

      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('1', 'admin-1', UserRole.ADMIN);
    });

    it('should throw UnauthorizedException if not owner or admin', async () => {
      const req = { user: { id: 'other-student', role: UserRole.STUDENT } } as any;

      mockCommentsService.remove.mockRejectedValue(
        new UnauthorizedException('Solo puedes eliminar tus propios comentarios'),
      );

      await expect(controller.remove('1', req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfessorComments', () => {
    it('should return all comments for a professor', async () => {
      const mockComments = [mockComment, { ...mockComment, id: '2' }];

      mockCommentsService.findByProfessor.mockResolvedValue(mockComments as any);

      const result = await controller.getProfessorComments('prof-1');

      expect(result).toEqual(mockComments);
      expect(service.findByProfessor).toHaveBeenCalledWith('prof-1');
    });

    it('should return empty array if professor has no comments', async () => {
      mockCommentsService.findByProfessor.mockResolvedValue([]);

      const result = await controller.getProfessorComments('prof-2');

      expect(result).toEqual([]);
      expect(service.findByProfessor).toHaveBeenCalledWith('prof-2');
    });
  });

  describe('getProfessorRating', () => {
    it('should return professor average rating', async () => {
      const mockRating = {
        average: 4.5,
        count: 10,
      };

      mockCommentsService.getProfessorAverageRating.mockResolvedValue(mockRating);

      const result = await controller.getProfessorRating('prof-1');

      expect(result).toEqual(mockRating);
      expect(service.getProfessorAverageRating).toHaveBeenCalledWith('prof-1');
    });

    it('should return zero rating if no comments exist', async () => {
      const mockRating = {
        average: 0,
        count: 0,
      };

      mockCommentsService.getProfessorAverageRating.mockResolvedValue(mockRating);

      const result = await controller.getProfessorRating('prof-2');

      expect(result).toEqual(mockRating);
    });
  });
});
