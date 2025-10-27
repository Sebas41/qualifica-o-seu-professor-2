import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rating } from '../ratings/entities/rating.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Professor } from './entities/professor.entity';
import { ProfessorsService } from './professors.service';

describe('ProfessorsService', () => {
  let service: ProfessorsService;
  let professorRepo: jest.Mocked<Repository<Professor>>;
  let ratingRepo: jest.Mocked<Repository<Rating>>;

  const mockProfessorRepo = (): jest.Mocked<Repository<Professor>> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Professor>>;

  const mockRatingRepo = (): jest.Mocked<Repository<Rating>> => ({
    createQueryBuilder: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Rating>>;

  const createQueryBuilderMock = () => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ average: '4.5', count: '2' }),
    };
    return qb;
  };

  beforeEach(() => {
    professorRepo = mockProfessorRepo();
    ratingRepo = mockRatingRepo();
    ratingRepo.createQueryBuilder.mockImplementation(() => createQueryBuilderMock());
    service = new ProfessorsService(professorRepo as unknown as Repository<Professor>, ratingRepo as unknown as Repository<Rating>);
  });

  it('should create a professor', async () => {
    const dto: CreateProfessorDto = { fullName: 'Prof', department: 'Dept' };
    professorRepo.create.mockReturnValue(dto as Professor);
    professorRepo.save.mockResolvedValue({ id: '1', ...dto } as Professor);

    const result = await service.create(dto);

    expect(result.id).toBe('1');
    expect(professorRepo.save).toHaveBeenCalled();
  });

  it('should return professors with rating summary', async () => {
    professorRepo.find.mockResolvedValue([{ id: '1', fullName: 'Prof', department: 'Dept' } as Professor]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].averageScore).toBe(4.5);
    expect(result[0].ratingsCount).toBe(2);
  });

  it('should throw when professor not found', async () => {
    professorRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update professor', async () => {
    const dto: UpdateProfessorDto = { department: 'New' };
    professorRepo.preload.mockResolvedValue({ id: '1', ...dto } as Professor);
    professorRepo.save.mockResolvedValue({ id: '1', ...dto } as Professor);

    const result = await service.update('1', dto);

    expect(result.department).toBe('New');
  });

  it('should remove professor', async () => {
    const professor = { id: '1' } as Professor;
    professorRepo.findOne.mockResolvedValue(professor);

    await service.remove('1');

    expect(professorRepo.remove).toHaveBeenCalledWith(professor);
  });
});
