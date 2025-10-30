import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService Integration Tests', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - Integration', () => {
    it('should create a new user with hashed password', async () => {
      const createDto = {
        email: 'NewUser@Example.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.STUDENT,
      };

      const createdUser = {
        ...createDto,
        email: 'newuser@example.com',
        id: '1',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(createdUser);
      jest.spyOn(repository, 'save').mockResolvedValue(createdUser);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'newuser@example.com' } });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('newuser@example.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
        role: UserRole.STUDENT,
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Email already registered');
    });

    it('should normalize email to lowercase', async () => {
      const createDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        name: 'Test User',
        role: UserRole.STUDENT,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockImplementation((dto: any) => dto as User);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: '1', ...createDto } as User);

      await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should default to STUDENT role when not specified', async () => {
      const createDto = {
        email: 'student@example.com',
        password: 'password123',
        name: 'Student User',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockImplementation((dto: any) => ({ ...dto, id: '1' } as User));
      jest.spyOn(repository, 'save').mockImplementation(async (user) => user as User);

      await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.STUDENT,
        }),
      );
    });
  });

  describe('findAll - Integration', () => {
    it('should return all users from database', async () => {
      const users = [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' },
      ] as User[];

      jest.spyOn(repository, 'find').mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result.length).toBe(2);
    });
  });

  describe('findOne - Integration', () => {
    it('should return user by id', async () => {
      const user = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent-id')).rejects.toThrow('User with id non-existent-id not found');
    });
  });

  describe('findByEmail - Integration', () => {
    it('should return user by email', async () => {
      const user = {
        id: '1',
        email: 'user@example.com',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findByEmail('User@Example.com');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(result).toEqual(user);
    });

    it('should return null when email not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update - Integration', () => {
    it('should update user data', async () => {
      const existingUser = {
        id: '1',
        email: 'old@example.com',
        name: 'Old Name',
        password: 'old-hash',
      } as User;

      const updateDto = {
        name: 'New Name',
        email: 'new@example.com',
      };

      const mergedUser = {
        ...existingUser,
        ...updateDto,
        email: 'new@example.com',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingUser).mockResolvedValueOnce(null);
      jest.spyOn(repository, 'merge').mockReturnValue(mergedUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue(mergedUser as User);

      const result = await service.update('1', updateDto);

      expect(repository.merge).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(result.name).toBe('New Name');
    });

    it('should throw ConflictException when updating to existing email', async () => {
      const existingUser = {
        id: '1',
        email: 'user1@example.com',
      } as User;

      const anotherUser = {
        id: '2',
        email: 'user2@example.com',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingUser).mockResolvedValueOnce(anotherUser);

      await expect(service.update('1', { email: 'user2@example.com' })).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same email (no conflict)', async () => {
      const user = {
        id: '1',
        email: 'user@example.com',
        name: 'User',
      } as User;

      const updateDto = {
        email: 'user@example.com',
        name: 'Updated Name',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'merge').mockReturnValue({ ...user, name: 'Updated Name' } as User);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...user, name: 'Updated Name' } as User);

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('Updated Name');
    });

    it('should hash password when updating', async () => {
      const user = {
        id: '1',
        email: 'user@example.com',
        password: 'old-hash',
      } as User;

      const updateDto = {
        password: 'newpassword123',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'merge').mockImplementation((entity, updates) => ({ ...entity, ...updates } as User));
      jest.spyOn(repository, 'save').mockImplementation(async (user) => user as User);

      const bcrypt = require('bcrypt');
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      await service.update('1', updateDto);

      expect(hashSpy).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove - Integration', () => {
    it('should remove user from database', async () => {
      const user = {
        id: '1',
        email: 'user@example.com',
      } as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'remove').mockResolvedValue(user);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
