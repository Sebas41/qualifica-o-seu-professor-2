import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { EmailService } from './email.service';
import { MagicLink } from './entities/magic-link.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock }; 
  let configService: { get: jest.Mock };
  let blacklistedTokenRepository: jest.Mocked<Repository<BlacklistedToken>>;
  let emailService: jest.Mocked<EmailService>;
  let magicLinkRepository: jest.Mocked<Repository<MagicLink>>;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') return 'secret';
        if (key === 'JWT_EXPIRES_IN') return '1d';
        return defaultValue || 'secret';
      }),
    };

    blacklistedTokenRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<BlacklistedToken>>;

    emailService = {
      sendVerificationEmail: jest.fn(),
      sendWelcomeEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailService>;

    magicLinkRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<MagicLink>>;

    service = new AuthService(
      usersService, 
      jwtService as any, 
      configService as any,
      emailService,
      blacklistedTokenRepository,
      magicLinkRepository
    );
  });

  it('should register a user and return message', async () => {
    const dto: RegisterDto = { 
      name: 'New User', 
      email: 'new@example.com', 
      password: 'Secret123', 
      role: UserRole.STUDENT 
    };
    const user = { id: '1', name: dto.name, email: dto.email, password: 'hashed', role: UserRole.STUDENT, isEmailVerified: false } as any;
    usersService.create.mockResolvedValue(user);
    usersService.findByEmail.mockResolvedValue(user);
    magicLinkRepository.findOne.mockResolvedValue(null);
    magicLinkRepository.create.mockReturnValue({} as any);
    magicLinkRepository.save.mockResolvedValue({} as any);
    emailService.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await service.register(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result.message).toBe('Account created successfully. Please check your email to verify your account.');
    expect(result.user).toEqual(user);
  });

  it('should login and return token when credentials are valid and email is verified', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'Secret123' };
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = { 
      id: '1', 
      email: dto.email, 
      password: hashed, 
      role: UserRole.STUDENT, 
      isEmailVerified: true 
    } as any;
    usersService.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.login(dto);

    expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(result.accessToken).toBe('token');
    expect(result.user).toEqual(user);
  });

  it('should not return accessToken when email is not verified', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'Secret123' };
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = { 
      id: '1', 
      email: dto.email, 
      password: hashed, 
      role: UserRole.STUDENT, 
      isEmailVerified: false 
    } as any;
    usersService.findByEmail.mockResolvedValue(user);
    magicLinkRepository.findOne.mockResolvedValue(null);
    magicLinkRepository.create.mockReturnValue({} as any);
    magicLinkRepository.save.mockResolvedValue({} as any);
    emailService.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await service.login(dto);

    expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(result.accessToken).toBeUndefined();
    expect(result.emailVerified).toBe(false);
    expect(result.user).toEqual(user);
  });

  it('should throw when user not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(service.login({ email: 'missing@example.com', password: '123456' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should throw when password is invalid', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'Secret123' };
    const hashed = await bcrypt.hash('AnotherPassword', 10);
    usersService.findByEmail.mockResolvedValue({ 
      id: '1', 
      email: dto.email, 
      password: hashed, 
      role: UserRole.STUDENT,
      isEmailVerified: true 
    } as any);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should allow admin to create another admin', async () => {
    const dto: RegisterDto = { 
      name: 'Admin User', 
      email: 'admin2@example.com', 
      password: 'Secret123', 
      role: UserRole.ADMIN 
    };
    const currentUser = { id: '1', role: UserRole.ADMIN } as any;
    const user = { 
      id: '2', 
      name: dto.name, 
      email: dto.email, 
      password: 'hashed', 
      role: UserRole.ADMIN,
      isEmailVerified: false 
    } as any;
    usersService.create.mockResolvedValue(user);
    usersService.findByEmail.mockResolvedValue(user);
    magicLinkRepository.findOne.mockResolvedValue(null);
    magicLinkRepository.create.mockReturnValue({} as any);
    magicLinkRepository.save.mockResolvedValue({} as any);
    emailService.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await service.register(dto, currentUser);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result.message).toBe('Account created successfully. Please check your email to verify your account.');
    expect(result.user).toEqual(user);
  });

  it('should prevent non-admin from creating admin', async () => {
    const dto: RegisterDto = { 
      name: 'Admin User', 
      email: 'admin2@example.com', 
      password: 'Secret123', 
      role: UserRole.ADMIN 
    };
    const currentUser = { id: '1', role: UserRole.STUDENT } as any;

    await expect(service.register(dto, currentUser)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should prevent unauthenticated user from creating admin', async () => {
    const dto: RegisterDto = { 
      name: 'Admin User', 
      email: 'admin2@example.com', 
      password: 'Secret123', 
      role: UserRole.ADMIN 
    };

    await expect(service.register(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should create student when no role is specified and no current user', async () => {
    const dto: RegisterDto = { 
      name: 'Student User', 
      email: 'student@example.com', 
      password: 'Secret123',
      role: UserRole.STUDENT
    };
    const user = { 
      id: '1', 
      name: dto.name, 
      email: dto.email, 
      password: 'hashed', 
      role: UserRole.STUDENT,
      isEmailVerified: false 
    } as any;
    usersService.create.mockResolvedValue(user);
    usersService.findByEmail.mockResolvedValue(user);
    magicLinkRepository.findOne.mockResolvedValue(null);
    magicLinkRepository.create.mockReturnValue({} as any);
    magicLinkRepository.save.mockResolvedValue({} as any);
    emailService.sendVerificationEmail.mockResolvedValue(undefined);

    const result = await service.register(dto);

    expect(result.message).toBe('Account created successfully. Please check your email to verify your account.');
    expect(result.user).toEqual(user);
  });

  it('should get user profile', async () => {
    const user = { id: '1', email: 'test@example.com', role: UserRole.STUDENT } as any;
    usersService.findOne.mockResolvedValue(user);

    const result = await service.getProfile('1');

    expect(usersService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('should logout and blacklist token', async () => {
    const token = 'valid-token';
    const decoded = { 
      sub: '1', 
      email: 'test@example.com', 
      role: UserRole.STUDENT,
      jti: 'token-id-123',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    jwtService.verifyAsync.mockResolvedValue(decoded);
    blacklistedTokenRepository.create.mockReturnValue({
      jti: decoded.jti,
      expiresAt: new Date(decoded.exp * 1000),
      blacklistedAt: new Date(),
    } as BlacklistedToken);
    blacklistedTokenRepository.save.mockResolvedValue({
      jti: decoded.jti,
      expiresAt: new Date(decoded.exp * 1000),
      blacklistedAt: new Date(),
    } as BlacklistedToken);

    const result = await service.logout(token);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: 'secret' });
    expect(blacklistedTokenRepository.create).toHaveBeenCalled();
    expect(blacklistedTokenRepository.save).toHaveBeenCalled();
    expect(result.message).toBe('Logout successful');
    expect(result).toHaveProperty('timestamp');
  });

  it('should logout even if token verification fails', async () => {
    const token = 'invalid-token';

    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    const result = await service.logout(token);

    expect(result.message).toBe('Logout successful');
    expect(result).toHaveProperty('timestamp');
  });

  it('should logout token without jti', async () => {
    const token = 'token-without-jti';
    const decoded = { 
      sub: '1', 
      email: 'test@example.com', 
      role: UserRole.STUDENT,
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    jwtService.verifyAsync.mockResolvedValue(decoded);

    const result = await service.logout(token);

    expect(jwtService.verifyAsync).toHaveBeenCalled();
    expect(blacklistedTokenRepository.create).not.toHaveBeenCalled();
    expect(result.message).toBe('Logout successful');
  });
});
