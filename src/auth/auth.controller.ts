import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    // Si el usuario está autenticado, usar su información para validar roles
    const currentUser = req.user as User | undefined;
    const { accessToken, user } = await this.authService.register(registerDto, currentUser);
    const { password, ...rest } = user;
    return { accessToken, user: rest };
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.authService.login(loginDto);
    const { password, ...rest } = user;
    return { accessToken, user: rest };
  }

  @Get('me')
  async getProfile(@Req() req: Request) {
    const user = await this.authService.getProfile((req.user as any).id);
    const { password, ...rest } = user;
    return rest;
  }
}