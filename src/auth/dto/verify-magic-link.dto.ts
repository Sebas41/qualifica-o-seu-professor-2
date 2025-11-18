import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyMagicLinkDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Magic link token received via email'
  })
  @IsString()
  @IsUUID()
  token!: string;
}

