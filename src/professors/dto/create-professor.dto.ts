import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({ 
    example: 'Dr. Juan Pérez',
    minLength: 2,
    maxLength: 120
  })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({ 
    example: 'Computer Science',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  department!: string;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'University ID (UUID)'
  })
  @IsUUID()
  university!: string;
}

