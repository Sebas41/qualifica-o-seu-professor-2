import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';

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
    description: 'User registered successfully. Verification email sent.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Account created successfully. Please check your email to verify your account.' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'student'], example: 'student' },
            isEmailVerified: { type: 'boolean', example: false }
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
    const { message, user } = await this.authService.register(registerDto, currentUser);
    const { password, ...rest } = user;
    return { message, user: rest };
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
  @ApiResponse({ 
    status: 200, 
    description: 'Login response',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { type: 'object' },
            emailVerified: { type: 'boolean', example: true }
          }
        },
        {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Email not verified. A new verification link has been sent to your email.' },
            user: { type: 'object' },
            emailVerified: { type: 'boolean', example: false }
          }
        }
      ]
    }
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    const { password, ...rest } = result.user;
    
    if (!result.emailVerified) {
      return { 
        message: 'Email not verified. A new verification link has been sent to your email.',
        user: rest,
        emailVerified: false
      };
    }
    
    return { token: result.accessToken, user: rest, emailVerified: true };
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logs out the currently authenticated user and invalidates the JWT token on the server side. After logout, the token cannot be used to access protected endpoints. The client should also remove the token from storage.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful - Token has been invalidated',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Logout successful' 
        },
        timestamp: { 
          type: 'string', 
          format: 'date-time', 
          example: '2024-01-01T12:00:00.000Z' 
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async logout(@Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      throw new UnauthorizedException('Token not found in request');
    }

    return this.authService.logout(token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resend email verification link',
    description: 'Sends a new verification link to the user email. The previous link will be invalidated. The link expires in 15 minutes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Verification email sent. Please check your inbox.' 
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'User not found or email already verified' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async resendVerification(@Body() requestMagicLinkDto: RequestMagicLinkDto) {
    return this.authService.sendVerificationEmail(requestMagicLinkDto.email);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ 
    summary: 'Verify email address',
    description: 'Verifies the email using the token received via email. After verification, the user can login with their credentials. The verification link can only be used once and expires after 15 minutes.'
  })
  @ApiQuery({ 
    name: 'token', 
    required: true, 
    description: 'Verification token received via email',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Email verified successfully. You can now login.'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'student'], example: 'student' },
            isEmailVerified: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid, expired, or already used verification link' })
  async verifyEmail(@Query('token') token: string) {
    const { message, user } = await this.authService.verifyEmail(token);
    const { password, ...rest } = user;
    return { message, user: rest };
  }
}