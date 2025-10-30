import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ 
    example: 'Excellent professor, very clear in his explanations',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @Length(1, 1000)
  content!: string;

  @ApiProperty({ 
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
    description: 'Rating from 1 to 5 (optional)'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Professor ID (UUID)'
  })
  @IsUUID()
  professor!: string;
}
