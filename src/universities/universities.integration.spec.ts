import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from '../professors/entities/professor.entity';
import { University } from './entities/university.entity';
import { UniversitiesService } from './universities.service';

describe('UniversitiesService - findProfessors Integration Tests', () => {
  let service: UniversitiesService;
  let repository: Repository<University>;
  let module: TestingModule;

  beforeAll(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        UniversitiesService,
        {
          provide: getRepositoryToken(University),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UniversitiesService>(UniversitiesService);
    repository = module.get<Repository<University>>(getRepositoryToken(University));
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findProfessors', () => {
    it('should return all professors of a university', async () => {
      const universityId = 'university-1';
      const mockProfessors = [
        {
          id: 'prof-1',
          name: 'Dr. John Doe',
          department: 'Computer Science',
          universityId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prof-2',
          name: 'Dr. Jane Smith',
          department: 'Mathematics',
          universityId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Professor[];

      const mockUniversity = {
        id: universityId,
        name: 'MIT',
        country: 'USA',
        city: 'Cambridge',
        professors: mockProfessors,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as University;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUniversity);

      const result = await service.findProfessors(universityId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: universityId },
        relations: ['professors'],
      });
      expect(result).toEqual(mockProfessors);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Dr. John Doe');
      expect(result[1].name).toBe('Dr. Jane Smith');
    });

    it('should return empty array when university has no professors', async () => {
      const universityId = 'university-2';
      const mockUniversity = {
        id: universityId,
        name: 'New University',
        country: 'USA',
        city: 'Boston',
        professors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as University;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUniversity);

      const result = await service.findProfessors(universityId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: universityId },
        relations: ['professors'],
      });
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should throw NotFoundException when university does not exist', async () => {
      const invalidId = 'non-existent-id';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findProfessors(invalidId)).rejects.toThrow(NotFoundException);
      await expect(service.findProfessors(invalidId)).rejects.toThrow(
        `University with ID ${invalidId} not found`
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: invalidId },
        relations: ['professors'],
      });
    });

    it('should include professor details in the response', async () => {
      const universityId = 'university-3';
      const mockProfessor = {
        id: 'prof-3',
        name: 'Dr. Alice Johnson',
        department: 'Physics',
        universityId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      } as Professor;

      const mockUniversity = {
        id: universityId,
        name: 'Harvard',
        country: 'USA',
        city: 'Cambridge',
        professors: [mockProfessor],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as University;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUniversity);

      const result = await service.findProfessors(universityId);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('department');
      expect(result[0]).toHaveProperty('universityId');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
      expect(result[0].department).toBe('Physics');
    });
  });
});
