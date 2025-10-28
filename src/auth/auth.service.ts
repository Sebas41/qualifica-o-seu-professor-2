import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, currentUser?: User): Promise<{ accessToken: string; user: User }> {
    // Solo admins pueden crear otros admins
    if (registerDto.role === UserRole.ADMIN && (!currentUser || currentUser.role !== UserRole.ADMIN)) {
      throw new UnauthorizedException('Solo los administradores pueden crear otros administradores');
    }

    // Si no hay usuario actual, solo permitir crear estudiantes
    if (!currentUser && registerDto.role === UserRole.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden crear otros administradores');
    }

    const user = await this.usersService.create(registerDto);
    const accessToken = await this.generateToken(user);
    return { accessToken, user };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const accessToken = await this.generateToken(user);
    return { accessToken, user };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET', 'defaultSecret'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1d'),
    });
  }
}