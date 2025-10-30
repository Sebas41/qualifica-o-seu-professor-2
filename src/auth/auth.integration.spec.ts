import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthController Integration Tests', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    // Mock del repositorio
    const mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockBlacklistedTokenRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(BlacklistedToken),
          useValue: mockBlacklistedTokenRepository,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register - Integration', () => {
    it('should register a new user and return access token', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      const savedUser = {
        id: '1',
        name: registerDto.name,
        email: registerDto.email.toLowerCase(),
        password: 'hashed-password',
        role: UserRole.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(savedUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

      const result = await authController.register(registerDto, { user: undefined } as any);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(UserRole.STUDENT);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

      await expect(authController.register(registerDto, { user: undefined } as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should prevent non-admin from creating admin users', async () => {
      const registerDto = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      await expect(authController.register(registerDto, { user: undefined } as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow admin to create another admin', async () => {
      const registerDto = {
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      const currentAdmin = {
        id: '1',
        role: UserRole.ADMIN,
      } as User;

      const savedUser = {
        id: '2',
        name: registerDto.name,
        email: registerDto.email.toLowerCase(),
        password: 'hashed-password',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(savedUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

      const result = await authController.register(registerDto, { user: currentAdmin } as any);

      expect(result).toHaveProperty('accessToken');
      expect(result.user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('POST /auth/login - Integration', () => {
    it('should login with valid credentials and return token', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: 'user@example.com',
        password: '$2b$10$YourHashedPasswordHere',
        role: UserRole.STUDENT,
        name: 'Test User',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authController.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('user@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: '1',
        email: 'user@example.com',
        password: '$2b$10$YourHashedPasswordHere',
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/me - Integration', () => {
    it('should return current user profile without password', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: UserRole.STUDENT,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await authController.getProfile({ user: { id: userId } } as any);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('role');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent-id';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authController.getProfile({ user: { id: userId } } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
