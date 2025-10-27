import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.usersService.create({ ...registerDto, role: UserRole.STUDENT });
    const accessToken = await this.generateToken(user);
    return { accessToken, user };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const accessToken = await this.generateToken(user);
    return { accessToken, user };
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
