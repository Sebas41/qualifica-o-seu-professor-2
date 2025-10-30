import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfessorsController } from './professors.controller';
import { ProfessorsService } from './professors.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

describe('ProfessorsController', () => {
  let controller: ProfessorsController;
  let service: jest.Mocked<ProfessorsService>;

  const mockProfessor = {
    id: '1',
    name: 'Dr. John Smith',
    department: 'Computer Science',
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
  };

  const mockProfessorsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessorsController],
      providers: [
        {
          provide: ProfessorsService,
          useValue: mockProfessorsService,
        },
      ],
    }).compile();

    controller = module.get<ProfessorsController>(ProfessorsController);
    service = module.get(ProfessorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of professors', async () => {
      const mockProfessors = [mockProfessor];
      mockProfessorsService.findAll.mockResolvedValue(mockProfessors as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockProfessors);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should filter by university', async () => {
      const mockProfessors = [mockProfessor];
      mockProfessorsService.findAll.mockResolvedValue(mockProfessors as any);

      const result = await controller.findAll('uni-1');

      expect(result).toEqual(mockProfessors);
      expect(service.findAll).toHaveBeenCalledWith('uni-1', undefined);
    });

    it('should filter by search query', async () => {
      const mockProfessors = [mockProfessor];
      mockProfessorsService.findAll.mockResolvedValue(mockProfessors as any);

      const result = await controller.findAll(undefined, 'John');

      expect(result).toEqual(mockProfessors);
      expect(service.findAll).toHaveBeenCalledWith(undefined, 'John');
    });

    it('should filter by both university and search', async () => {
      const mockProfessors = [mockProfessor];
      mockProfessorsService.findAll.mockResolvedValue(mockProfessors as any);

      const result = await controller.findAll('uni-1', 'Computer');

      expect(result).toEqual(mockProfessors);
      expect(service.findAll).toHaveBeenCalledWith('uni-1', 'Computer');
    });
  });

  describe('findOne', () => {
    it('should return a single professor', async () => {
      mockProfessorsService.findOne.mockResolvedValue(mockProfessor as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProfessor);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockProfessorsService.findOne.mockRejectedValue(
        new NotFoundException('Professor with ID "999" not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new professor', async () => {
      const createDto: CreateProfessorDto = {
        name: 'Dr. Jane Doe',
        department: 'Mathematics',
        university: 'uni-1',
      };

      const newProfessor = {
        ...mockProfessor,
        id: '2',
        ...createDto,
        universityId: createDto.university,
      };

      mockProfessorsService.create.mockResolvedValue(newProfessor as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newProfessor);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a professor', async () => {
      const updateDto: UpdateProfessorDto = {
        name: 'Dr. John Smith Updated',
        department: 'Software Engineering',
      };

      const updatedProfessor = {
        ...mockProfessor,
        ...updateDto,
      };

      mockProfessorsService.update.mockResolvedValue(updatedProfessor as any);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedProfessor);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException if professor not found', async () => {
      const updateDto: UpdateProfessorDto = {
        name: 'Updated Name',
      };

      mockProfessorsService.update.mockRejectedValue(
        new NotFoundException('Professor with ID "999" not found'),
      );

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a professor', async () => {
      mockProfessorsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual({ message: 'Professor deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if professor not found', async () => {
      mockProfessorsService.remove.mockRejectedValue(
        new NotFoundException('Professor with ID "999" not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
