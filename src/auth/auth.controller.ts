import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { accessToken, user } = await this.authService.register(registerDto);
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
}
