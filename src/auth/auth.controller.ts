import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(OptionalAuthGuard)
  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account. Students can register themselves, only admins can create other admins.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'student'], example: 'student' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 403, description: 'Only admins can create other admins' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    // If the user is authenticated, use their information to validate roles
    const currentUser = req.user as User | undefined;
    const { accessToken, user } = await this.authService.register(registerDto, currentUser);
    const { password, ...rest } = user;
    return { accessToken, user: rest };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates a user and returns an access token. Use this endpoint to obtain the token needed to access protected endpoints.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Login credentials',
    examples: {
      example1: {
        summary: 'Student login',
        value: {
          email: 'student@example.com',
          password: 'password123'
        }
      },
      example2: {
        summary: 'Admin login',
        value: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        token: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT token that must be used in the Authorization header as Bearer token'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'student'], example: 'student' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.authService.login(loginDto);
    const { password, ...rest } = user;
    return { token: accessToken, user: rest };
  }

  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the profile information of the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
        role: { type: 'string', enum: ['admin', 'student'], example: 'student' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user = await this.authService.getProfile((req.user as any).id);
    const { password, ...rest } = user;
    return rest;
  }
}