import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { Professor } from '../professors/entities/professor.entity';
import { User } from '../users/entities/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Rating } from './entities/rating.entity';
import { RatingsService } from './ratings.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let ratingsRepo: jest.Mocked<Repository<Rating>>;
  let professorsRepo: jest.Mocked<Repository<Professor>>;
  let usersRepo: jest.Mocked<Repository<User>>;

  const ratingRepositoryMock = (): jest.Mocked<Repository<Rating>> => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Rating>>;

  const professorRepositoryMock = (): jest.Mocked<Repository<Professor>> => ({
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Professor>>;

  const userRepositoryMock = (): jest.Mocked<Repository<User>> => ({
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<Repository<User>>;

  beforeEach(() => {
    ratingsRepo = ratingRepositoryMock();
    professorsRepo = professorRepositoryMock();
    usersRepo = userRepositoryMock();
    service = new RatingsService(
      ratingsRepo as unknown as Repository<Rating>,
      professorsRepo as unknown as Repository<Professor>,
      usersRepo as unknown as Repository<User>,
    );
  });

  describe('create', () => {
    it('should create rating for professor', async () => {
      const dto: CreateRatingDto = { professorId: 'prof1', score: 5 };
      professorsRepo.findOne.mockResolvedValue({ id: 'prof1' } as Professor);
      usersRepo.findOne.mockResolvedValue({ id: 'student1' } as User);
      ratingsRepo.findOne.mockResolvedValue(null);
      ratingsRepo.create.mockReturnValue({ score: 5 } as Rating);
      ratingsRepo.save.mockImplementation(async (rating) => ({ id: 'rate1', ...rating } as Rating));

      const result = await service.create(dto, 'student1');

      expect(result.id).toBe('rate1');
      expect(ratingsRepo.save).toHaveBeenCalled();
    });

    it('should not allow duplicate rating', async () => {
      const dto: CreateRatingDto = { professorId: 'prof1', score: 5 };
      professorsRepo.findOne.mockResolvedValue({ id: 'prof1' } as Professor);
      usersRepo.findOne.mockResolvedValue({ id: 'student1' } as User);
      ratingsRepo.findOne.mockResolvedValue({ id: 'rate1' } as Rating);

      await expect(service.create(dto, 'student1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw when professor does not exist', async () => {
      const dto: CreateRatingDto = { professorId: 'missing', score: 4 };
      professorsRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, 'student1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw when student does not exist', async () => {
      const dto: CreateRatingDto = { professorId: 'prof1', score: 4 };
      professorsRepo.findOne.mockResolvedValue({ id: 'prof1' } as Professor);
      usersRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, 'student1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update own rating', async () => {
      const dto: UpdateRatingDto = { score: 4 };
      const rating = {
        id: 'rate1',
        score: 3,
        student: { id: 'student1' },
        professor: { id: 'prof1' },
      } as unknown as Rating;
      ratingsRepo.findOne.mockResolvedValue(rating);
      ratingsRepo.save.mockImplementation(async (value) => value as Rating);

      const result = await service.update('rate1', dto, { id: 'student1', role: UserRole.STUDENT });

      expect(result.score).toBe(4);
    });

    it('should block updates from other students', async () => {
      const rating = {
        id: 'rate1',
        student: { id: 'student1' },
        professor: { id: 'prof1' },
      } as unknown as Rating;
      ratingsRepo.findOne.mockResolvedValue(rating);

      await expect(service.update('rate1', {}, { id: 'other', role: UserRole.STUDENT })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should throw when rating not found', async () => {
      ratingsRepo.findOne.mockResolvedValue(null);

      await expect(service.update('rate1', {}, { id: 'student1', role: UserRole.STUDENT })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should update professor when new id provided', async () => {
      const rating = {
        id: 'rate1',
        score: 3,
        student: { id: 'student1' },
        professor: { id: 'prof1' },
      } as unknown as Rating;
      ratingsRepo.findOne.mockResolvedValue(rating);
      professorsRepo.findOne.mockResolvedValue({ id: 'prof2' } as Professor);
      ratingsRepo.save.mockImplementation(async (value) => value as Rating);

      const result = await service.update(
        'rate1',
        { professorId: 'prof2', score: 5 },
        { id: 'student1', role: UserRole.STUDENT },
      );

      expect(result.professor.id).toBe('prof2');
      expect(result.score).toBe(5);
    });
  });

  describe('remove', () => {
    it('should remove rating when owner', async () => {
      const rating = { id: 'rate1', student: { id: 'student1' } } as unknown as Rating;
      ratingsRepo.findOne.mockResolvedValue(rating);

      await service.remove('rate1', { id: 'student1', role: UserRole.STUDENT });

      expect(ratingsRepo.remove).toHaveBeenCalledWith(rating);
    });

    it('should throw when not owner', async () => {
      const rating = { id: 'rate1', student: { id: 'student1' } } as unknown as Rating;
      ratingsRepo.findOne.mockResolvedValue(rating);

      await expect(service.remove('rate1', { id: 'other', role: UserRole.STUDENT })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should throw when rating does not exist', async () => {
      ratingsRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('rate1', { id: 'student1', role: UserRole.STUDENT })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
