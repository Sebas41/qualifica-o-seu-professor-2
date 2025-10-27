import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockRepository = (): jest.Mocked<Repository<User>> => ({
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  }) as unknown as jest.Mocked<Repository<User>>;

  beforeEach(() => {
    repository = mockRepository();
    service = new UsersService(repository as unknown as Repository<User>);
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'Test@Example.com',
      password: 'Secret123',
      fullName: 'Test User',
      role: UserRole.ADMIN,
    };

    it('should hash password and save user', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockImplementation((input) => input as unknown as User);
      repository.save.mockImplementation(async (input) => ({ id: '1', ...input } as User));

      const user = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
      expect(repository.save).toHaveBeenCalled();
      expect(user.id).toBeDefined();
      expect(user.password).not.toEqual(dto.password);
      expect(await bcrypt.compare(dto.password, user.password)).toBe(true);
    });

    it('should throw when email already exists', async () => {
      repository.findOne.mockResolvedValueOnce({ id: '1' } as User);

      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return user when exists', async () => {
      repository.findOne.mockResolvedValue({ id: '1' } as User);

      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1' });
    });

    it('should throw when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user data and hash password', async () => {
      const existing = { id: '1', email: 'old@example.com', password: 'hashed' } as User;
      repository.findOne.mockResolvedValueOnce(existing);
      repository.findOne.mockResolvedValueOnce(null);
      repository.merge.mockImplementation((entity, updates) => ({ ...entity, ...updates } as User));
      repository.save.mockImplementation(async (input) => input as User);

      const updates: UpdateUserDto = {
        email: 'new@example.com',
        password: 'NewSecret123',
      };

      const result = await service.update('1', updates);

      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(await bcrypt.compare('NewSecret123', result.password)).toBe(true);
    });

    it('should throw when updating to existing email', async () => {
      const existing = { id: '1', email: 'old@example.com', password: 'hashed' } as User;
      repository.findOne.mockResolvedValueOnce(existing);
      repository.findOne.mockResolvedValueOnce({ id: '2', email: 'new@example.com' } as User);

      await expect(service.update('1', { email: 'new@example.com' })).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const user = { id: '1' } as User;
      repository.findOne.mockResolvedValue(user);
      repository.remove.mockResolvedValue(user);

      await service.remove('1');
      expect(repository.remove).toHaveBeenCalledWith(user);
    });
  });
});
