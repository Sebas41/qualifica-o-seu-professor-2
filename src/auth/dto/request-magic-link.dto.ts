import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestMagicLinkDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Email address to send the magic link to'
  })
  @IsEmail()
  email!: string;
}

