import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty({ example: 'Dr. Maria Silva' })
  @IsString()
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @MaxLength(120)
  department!: string;

  @ApiProperty({ example: 'Expert in distributed systems', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}
