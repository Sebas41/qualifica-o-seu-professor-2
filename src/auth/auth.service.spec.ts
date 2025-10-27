import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: { signAsync: jest.Mock }; 
  let configService: { get: jest.Mock };

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('secret'),
    };

    service = new AuthService(usersService, jwtService as any, configService as any);
  });

  it('should register a user and return token', async () => {
    const dto: RegisterDto = { email: 'new@example.com', password: 'Secret123', fullName: 'New User' };
    const user = { id: '1', email: dto.email, password: 'hashed', role: UserRole.STUDENT } as any;
    usersService.create.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.register(dto);

    expect(usersService.create).toHaveBeenCalledWith({ ...dto, role: UserRole.STUDENT });
    expect(result.accessToken).toBe('token');
    expect(result.user).toEqual(user);
  });

  it('should login and return token when credentials are valid', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'Secret123' };
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = { id: '1', email: dto.email, password: hashed, role: UserRole.STUDENT } as any;
    usersService.findByEmail.mockResolvedValue(user);
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.login(dto);

    expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(result.accessToken).toBe('token');
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
    usersService.findByEmail.mockResolvedValue({ id: '1', email: dto.email, password: hashed, role: UserRole.STUDENT } as any);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});