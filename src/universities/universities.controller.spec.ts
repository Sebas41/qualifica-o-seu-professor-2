import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

describe('UniversitiesController', () => {
  let controller: UniversitiesController;
  let service: jest.Mocked<UniversitiesService>;

  const mockUniversity = {
    id: '1',
    name: 'Test University',
    country: 'Test Country',
    city: 'Test City',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUniversitiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findProfessors: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniversitiesController],
      providers: [
        {
          provide: UniversitiesService,
          useValue: mockUniversitiesService,
        },
      ],
    }).compile();

    controller = module.get<UniversitiesController>(UniversitiesController);
    service = module.get(UniversitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of universities', async () => {
      const mockUniversities = [mockUniversity];
      mockUniversitiesService.findAll.mockResolvedValue(mockUniversities as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockUniversities);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no universities exist', async () => {
      mockUniversitiesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single university', async () => {
      mockUniversitiesService.findOne.mockResolvedValue(mockUniversity as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUniversity);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if university not found', async () => {
      mockUniversitiesService.findOne.mockRejectedValue(
        new NotFoundException('University with ID "999" not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new university', async () => {
      const createDto: CreateUniversityDto = {
        name: 'New University',
        country: 'New Country',
        city: 'New City',
      };

      const newUniversity = {
        ...mockUniversity,
        id: '2',
        ...createDto,
      };

      mockUniversitiesService.create.mockResolvedValue(newUniversity as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newUniversity);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a university', async () => {
      const updateDto: UpdateUniversityDto = {
        name: 'Updated University',
        country: 'Updated Country',
        city: 'Updated City',
      };

      const updatedUniversity = {
        ...mockUniversity,
        ...updateDto,
      };

      mockUniversitiesService.update.mockResolvedValue(updatedUniversity as any);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedUniversity);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should update partial fields', async () => {
      const updateDto: UpdateUniversityDto = {
        name: 'Partially Updated',
      };

      const updatedUniversity = {
        ...mockUniversity,
        name: 'Partially Updated',
      };

      mockUniversitiesService.update.mockResolvedValue(updatedUniversity as any);

      const result = await controller.update('1', updateDto);

      expect(result.name).toBe('Partially Updated');
      expect(result.city).toBe(mockUniversity.city);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException if university not found', async () => {
      const updateDto: UpdateUniversityDto = {
        name: 'Updated Name',
      };

      mockUniversitiesService.update.mockRejectedValue(
        new NotFoundException('University with ID "999" not found'),
      );

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a university', async () => {
      mockUniversitiesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual({ message: 'University deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if university not found', async () => {
      mockUniversitiesService.remove.mockRejectedValue(
        new NotFoundException('University with ID "999" not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findProfessors', () => {
    it('should return professors of a university', async () => {
      const mockProfessors = [
        {
          id: '1',
          name: 'Prof. John Doe',
          department: 'Computer Science',
          universityId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Prof. Jane Smith',
          department: 'Mathematics',
          universityId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUniversitiesService.findProfessors.mockResolvedValue(mockProfessors);

      const result = await controller.findProfessors('1');

      expect(result).toEqual(mockProfessors);
      expect(service.findProfessors).toHaveBeenCalledWith('1');
    });

    it('should return empty array when university has no professors', async () => {
      mockUniversitiesService.findProfessors.mockResolvedValue([]);

      const result = await controller.findProfessors('1');

      expect(result).toEqual([]);
      expect(service.findProfessors).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if university not found', async () => {
      mockUniversitiesService.findProfessors.mockRejectedValue(
        new NotFoundException('University with ID "999" not found'),
      );

      await expect(controller.findProfessors('999')).rejects.toThrow(NotFoundException);
    });
  });
});
