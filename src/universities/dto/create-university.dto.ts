import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateUniversityDto {
  @ApiProperty({ 
    example: 'Universidad Nacional de Colombia',
    minLength: 2,
    maxLength: 120
  })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({ 
    example: 'Colombia',
    required: false
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ 
    example: 'Bogotá',
    required: false
  })
  @IsOptional()
  @IsString()
  city?: string;
}
