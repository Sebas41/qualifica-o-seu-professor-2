import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../common/enums/role.enum';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.STUDENT,
    password: 'hashedPassword',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new student successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'student@example.com',
        password: 'password123',
        name: 'Student User',
        role: UserRole.STUDENT,
      };

      const mockResult = {
        message: 'Account created successfully. Please check your email to verify your account.',
        user: mockUser,
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const req = { user: undefined } as any;
      const result = await controller.register(registerDto, req);

      expect(result).toEqual({
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          isEmailVerified: mockUser.isEmailVerified,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
      expect(authService.register).toHaveBeenCalledWith(registerDto, undefined);
    });

    it('should register a new admin when current user is admin', async () => {
      const registerDto: RegisterDto = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };

      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const mockResult = {
        message: 'Account created successfully. Please check your email to verify your account.',
        user: adminUser,
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const req = { user: adminUser } as any;
      const result = await controller.register(registerDto, req);

      expect(result.user).not.toHaveProperty('password');
      expect(authService.register).toHaveBeenCalledWith(registerDto, adminUser);
    });

    it('should exclude password from response', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.STUDENT,
      };

      mockAuthService.register.mockResolvedValue({
        message: 'Account created successfully. Please check your email to verify your account.',
        user: mockUser,
      });

      const req = { user: undefined } as any;
      const result = await controller.register(registerDto, req);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should login a user with verified email successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        accessToken: 'mock-token',
        user: mockUser,
        emailVerified: true,
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        token: 'mock-token',
        emailVerified: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          isEmailVerified: mockUser.isEmailVerified,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return email verification message for unverified email', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      const mockResult = {
        emailVerified: false,
        message: 'Email not verified. A new verification link has been sent to your email.',
        user: unverifiedUser,
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        emailVerified: false,
        message: 'Email not verified. A new verification link has been sent to your email.',
        user: {
          id: unverifiedUser.id,
          email: unverifiedUser.email,
          name: unverifiedUser.name,
          role: unverifiedUser.role,
          isEmailVerified: unverifiedUser.isEmailVerified,
          createdAt: unverifiedUser.createdAt,
          updatedAt: unverifiedUser.updatedAt,
        },
      });
      expect(result).not.toHaveProperty('token');
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should exclude password from login response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue({
        accessToken: 'mock-token',
        user: mockUser,
        emailVerified: true,
      });

      const result = await controller.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { id: '1' } } as any;

      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isEmailVerified: mockUser.isEmailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
      expect(authService.getProfile).toHaveBeenCalledWith('1');
    });
  });
});
