import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.STUDENT,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and exclude password', async () => {
      const createDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.STUDENT,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return array of users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'user2@example.com' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return current user profile without password', async () => {
      const req = { user: { id: '1' } } as any;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findOne', () => {
    it('should return a single user without password', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user and exclude password', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateDto);

      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe('Updated User');
      expect(result.email).toBe('updated@example.com');
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated User',
      };

      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
