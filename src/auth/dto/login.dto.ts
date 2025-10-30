import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Email User Login'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ 
    example: 'password123',
    minLength: 6,
    description: 'Password User Login (minimum 6 characters)'
  })
  @IsString()
  @MinLength(6)
  password!: string;
}