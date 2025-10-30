import { NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Professor } from './entities/professor.entity';
import { ProfessorsService } from './professors.service';

describe('ProfessorsService', () => {
  let service: ProfessorsService;
  let repository: jest.Mocked<Repository<Professor>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Professor>>;

  const mockRepository = (): jest.Mocked<Repository<Professor>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as unknown as jest.Mocked<Repository<Professor>>;

  const mockQueryBuilder = (): jest.Mocked<SelectQueryBuilder<Professor>> => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }) as unknown as jest.Mocked<SelectQueryBuilder<Professor>>;

  beforeEach(() => {
    repository = mockRepository();
    queryBuilder = mockQueryBuilder();
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    service = new ProfessorsService(repository);
  });

  describe('create', () => {
    it('should create a professor', async () => {
      const dto: CreateProfessorDto = {
        name: 'Dr. Smith',
        department: 'Computer Science',
        university: 'university-id-1',
      };

      const professor = {
        id: '1',
        name: dto.name,
        department: dto.department,
        universityId: dto.university,
      } as Professor;

      repository.create.mockReturnValue(professor);
      repository.save.mockResolvedValue(professor);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        department: dto.department,
        universityId: dto.university,
      });
      expect(repository.save).toHaveBeenCalledWith(professor);
      expect(result).toEqual(professor);
    });
  });

  describe('findAll', () => {
    it('should return all professors', async () => {
      const professors = [
        { id: '1', name: 'Dr. Smith', department: 'CS' },
        { id: '2', name: 'Dr. Jones', department: 'Math' },
      ] as Professor[];

      queryBuilder.getMany.mockResolvedValue(professors);

      const result = await service.findAll();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('professor');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('professor.university', 'university');
      expect(result).toEqual(professors);
    });

    it('should filter by universityId', async () => {
      const professors = [{ id: '1', name: 'Dr. Smith', universityId: 'uni-1' }] as Professor[];
      queryBuilder.getMany.mockResolvedValue(professors);

      await service.findAll('uni-1');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('professor.universityId = :universityId', {
        universityId: 'uni-1',
      });
    });

    it('should filter by search term', async () => {
      const professors = [{ id: '1', name: 'Dr. Smith' }] as Professor[];
      queryBuilder.getMany.mockResolvedValue(professors);

      await service.findAll(undefined, 'Smith');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('professor.name ILIKE :search', {
        search: '%Smith%',
      });
    });

    it('should filter by both universityId and search', async () => {
      const professors = [{ id: '1', name: 'Dr. Smith' }] as Professor[];
      queryBuilder.getMany.mockResolvedValue(professors);

      await service.findAll('uni-1', 'Smith');

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOne', () => {
    it('should return a professor by id', async () => {
      const professor = { id: '1', name: 'Dr. Smith' } as Professor;
      repository.findOne.mockResolvedValue(professor);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['university'],
      });
      expect(result).toEqual(professor);
    });

    it('should throw NotFoundException when professor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('Professor with ID "999" not found');
    });
  });

  describe('update', () => {
    it('should update professor name', async () => {
      const professor = {
        id: '1',
        name: 'Dr. Smith',
        department: 'CS',
        universityId: 'uni-1',
      } as Professor;

      repository.findOne.mockResolvedValue(professor);
      repository.save.mockResolvedValue({ ...professor, name: 'Dr. Johnson' });

      const dto: UpdateProfessorDto = { name: 'Dr. Johnson' };
      const result = await service.update('1', dto);

      expect(result.name).toBe('Dr. Johnson');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update professor department', async () => {
      const professor = {
        id: '1',
        name: 'Dr. Smith',
        department: 'CS',
        universityId: 'uni-1',
      } as Professor;

      repository.findOne.mockResolvedValue(professor);
      repository.save.mockResolvedValue({ ...professor, department: 'Mathematics' });

      const dto: UpdateProfessorDto = { department: 'Mathematics' };
      const result = await service.update('1', dto);

      expect(result.department).toBe('Mathematics');
    });

    it('should update professor university', async () => {
      const professor = {
        id: '1',
        name: 'Dr. Smith',
        department: 'CS',
        universityId: 'uni-1',
      } as Professor;

      repository.findOne.mockResolvedValue(professor);
      repository.save.mockResolvedValue({ ...professor, universityId: 'uni-2' });

      const dto: UpdateProfessorDto = { university: 'uni-2' };
      const result = await service.update('1', dto);

      expect(result.universityId).toBe('uni-2');
    });

    it('should throw NotFoundException when professor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { name: 'New Name' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a professor', async () => {
      const professor = { id: '1', name: 'Dr. Smith' } as Professor;
      repository.findOne.mockResolvedValue(professor);
      repository.remove.mockResolvedValue(professor);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(professor);
    });

    it('should throw NotFoundException when professor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
