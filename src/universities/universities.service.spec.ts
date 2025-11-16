import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { University } from './entities/university.entity';
import { UniversitiesService } from './universities.service';

describe('UniversitiesService', () => {
  let service: UniversitiesService;
  let repository: jest.Mocked<Repository<University>>;

  const mockRepository = (): jest.Mocked<Repository<University>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<Repository<University>>;

  beforeEach(() => {
    repository = mockRepository();
    service = new UniversitiesService(repository);
  });

  describe('create', () => {
    it('should create a university', async () => {
      const dto: CreateUniversityDto = {
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
      };

      const university = { id: '1', ...dto } as University;

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(university);
      repository.save.mockResolvedValue(university);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { name: dto.name } });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(university);
      expect(result).toEqual(university);
    });

    it('should throw ConflictException when university name already exists', async () => {
      const dto: CreateUniversityDto = {
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
      };

      repository.findOne.mockResolvedValue({ id: '1', name: 'MIT' } as University);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow('University with this name already exists');
    });
  });

  describe('findAll', () => {
    it('should return all universities ordered by name', async () => {
      const universities = [
        { id: '1', name: 'MIT', country: 'USA' },
        { id: '2', name: 'Harvard', country: 'USA' },
      ] as University[];

      repository.find.mockResolvedValue(universities);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(universities);
    });
  });

  describe('findOne', () => {
    it('should return a university by id with professors', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        professors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as University;

      repository.findOne.mockResolvedValue(university);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['professors'],
      });
      expect(result).toEqual(university);
    });

    it('should throw NotFoundException when university not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('University with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update university data', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
      } as University;

      const dto: UpdateUniversityDto = {
        country: 'United States',
        city: 'Cambridge, MA',
      };

      repository.findOne.mockResolvedValueOnce(university);
      repository.save.mockResolvedValue({ ...university, ...dto });

      const result = await service.update('1', dto);

      expect(result.country).toBe('United States');
      expect(result.city).toBe('Cambridge, MA');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update university name if it does not exist', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
      } as University;

      const dto: UpdateUniversityDto = {
        name: 'Massachusetts Institute of Technology',
      };

      repository.findOne.mockResolvedValueOnce(university);
      repository.findOne.mockResolvedValueOnce(null);
      repository.save.mockResolvedValue({ ...university, ...dto });

      const result = await service.update('1', dto);

      expect(result.name).toBe('Massachusetts Institute of Technology');
    });

    it('should throw ConflictException when updating to existing name', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        country: 'USA',
      } as University;

      const dto: UpdateUniversityDto = {
        name: 'Harvard',
      };

      repository.findOne.mockResolvedValueOnce(university);
      repository.findOne.mockResolvedValueOnce({ id: '2', name: 'Harvard' } as University);

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
    });

    it('should not check name uniqueness when name is not changed', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        country: 'USA',
      } as University;

      const dto: UpdateUniversityDto = {
        country: 'United States',
      };

      repository.findOne.mockResolvedValueOnce(university);
      repository.save.mockResolvedValue({ ...university, ...dto });

      await service.update('1', dto);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when university not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('999', { name: 'New Name' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a university', async () => {
      const university = { id: '1', name: 'MIT' } as University;
      repository.findOne.mockResolvedValue(university);
      repository.remove.mockResolvedValue(university);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(university);
    });

    it('should throw NotFoundException when university not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findProfessors', () => {
    it('should return professors of a university', async () => {
      const professors = [
        { id: '1', name: 'Prof. John Doe', department: 'Computer Science' },
        { id: '2', name: 'Prof. Jane Smith', department: 'Mathematics' },
      ];

      const university = {
        id: '1',
        name: 'MIT',
        professors,
      } as unknown as University;

      repository.findOne.mockResolvedValue(university);

      const result = await service.findProfessors('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['professors'],
      });
      expect(result).toEqual(professors);
    });

    it('should return empty array when university has no professors', async () => {
      const university = {
        id: '1',
        name: 'MIT',
        professors: [],
      } as unknown as University;

      repository.findOne.mockResolvedValue(university);

      const result = await service.findProfessors('1');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when university not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findProfessors('999')).rejects.toThrow(NotFoundException);
      await expect(service.findProfessors('999')).rejects.toThrow('University with ID 999 not found');
    });
  });
});
