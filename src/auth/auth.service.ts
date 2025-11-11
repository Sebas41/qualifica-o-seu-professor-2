import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { LessThan, Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './email.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { MagicLink } from './entities/magic-link.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
    @InjectRepository(MagicLink)
    private readonly magicLinkRepository: Repository<MagicLink>,
  ) {}

  async register(registerDto: RegisterDto, currentUser?: User): Promise<{ message: string; user: User }> {
    // Solo admins pueden crear otros admins
    if (registerDto.role === UserRole.ADMIN && (!currentUser || currentUser.role !== UserRole.ADMIN)) {
      throw new UnauthorizedException('Solo los administradores pueden crear otros administradores');
    }

    // Si no hay usuario actual, solo permitir crear estudiantes
    if (!currentUser && registerDto.role === UserRole.ADMIN) {
      throw new UnauthorizedException('Solo los administradores pueden crear otros administradores');
    }

    const user = await this.usersService.create(registerDto);
    
    // Enviar email de verificación automáticamente
    await this.sendVerificationEmail(user.email);
    
    return { 
      message: 'Account created successfully. Please check your email to verify your account.', 
      user 
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken?: string; user: User; emailVerified?: boolean }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // Verificar si el email está verificado
    if (!user.isEmailVerified) {
      // Enviar nuevo link de verificación
      await this.sendVerificationEmail(user.email);
      
      return { 
        user, 
        emailVerified: false 
      };
    }
    
    // Si está verificado, generar token JWT
    const accessToken = await this.generateToken(user);
    return { accessToken, user, emailVerified: true };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  async logout(token: string): Promise<{ message: string; timestamp: string }> {
    try {
      // Decode the token to extract jti and expiration
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET', 'defaultSecret'),
      }) as JwtPayload & { jti?: string; exp?: number };

      // If token has jti, add it to blacklist
      if (decoded.jti) {
        const expiresAt = decoded.exp 
          ? new Date(decoded.exp * 1000) 
          : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h if no exp

        const blacklistedToken = this.blacklistedTokenRepository.create({
          jti: decoded.jti,
          expiresAt,
        });

        await this.blacklistedTokenRepository.save(blacklistedToken);
      }
    } catch (error) {
      // If token is invalid or expired, still return success
      // The client should remove the token anyway
    }

    return {
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };
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

  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase();

    // Verificar si el usuario existe
    const user = await this.usersService.findByEmail(normalizedEmail);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Si ya está verificado, no enviar email
    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Limpiar magic links expirados
    await this.cleanExpiredMagicLinks();

    // Buscar si ya existe un magic link para este email
    const existingLink = await this.magicLinkRepository.findOne({
      where: { email: normalizedEmail },
    });

    let token: string;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

    if (existingLink) {
      // Actualizar el token existente
      token = randomUUID();
      existingLink.token = token;
      existingLink.expiresAt = expiresAt;
      existingLink.isUsed = false;
      await this.magicLinkRepository.save(existingLink);
    } else {
      // Crear nuevo magic link
      token = randomUUID();
      const magicLink = this.magicLinkRepository.create({
        email: normalizedEmail,
        token,
        expiresAt,
      });
      await this.magicLinkRepository.save(magicLink);
    }

    // Construir URL del magic link
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
    const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;

    // Enviar email con el enlace de verificación
    await this.emailService.sendVerificationEmail(normalizedEmail, verificationUrl);

    return {
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; user: User }> {
    // Buscar el magic link
    const magicLink = await this.magicLinkRepository.findOne({
      where: { token },
    });

    if (!magicLink) {
      throw new UnauthorizedException('Invalid verification link');
    }

    // Verificar si ya fue usado
    if (magicLink.isUsed) {
      throw new UnauthorizedException('Verification link has already been used');
    }

    // Verificar si expiró
    if (new Date() > magicLink.expiresAt) {
      throw new UnauthorizedException('Verification link has expired');
    }

    // Buscar el usuario
    const user = await this.usersService.findByEmail(magicLink.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Marcar el email como verificado
    await this.usersService.update(user.id, {
      isEmailVerified: true,
    });

    // Marcar el magic link como usado
    magicLink.isUsed = true;
    await this.magicLinkRepository.save(magicLink);

    // Recargar usuario con el campo actualizado
    const updatedUser = await this.usersService.findOne(user.id);

    return { 
      message: 'Email verified successfully. You can now login.', 
      user: updatedUser 
    };
  }

  private async cleanExpiredMagicLinks(): Promise<void> {
    // Eliminar magic links expirados o usados hace más de 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.magicLinkRepository.delete({
      expiresAt: LessThan(oneDayAgo),
    });
  }

  private async generateToken(user: User): Promise<string> {
    const jti = randomUUID(); // Generate unique token ID for blacklisting
    const payload: JwtPayload & { jti: string } = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      jti 
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET', 'defaultSecret'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1d'),
    });
  }
}