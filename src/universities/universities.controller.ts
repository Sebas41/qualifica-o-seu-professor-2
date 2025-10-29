import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { University } from './entities/university.entity';
import { UniversitiesService } from './universities.service';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all universities',
    description: 'Retrieves a list of all universities. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Universities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          name: { type: 'string', example: 'University of Example' },
          location: { type: 'string', example: 'Example City' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
        }
      }
    }
  })
  async findAll(): Promise<University[]> {
    return this.universitiesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get university by ID',
    description: 'Retrieves a specific university by its ID. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'University retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'University of Example' },
        location: { type: 'string', example: 'Example City' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'University not found' })
  async findOne(@Param('id') id: string): Promise<University> {
    return this.universitiesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ 
    summary: 'Create a new university',
    description: 'Creates a new university. Only admins can create universities.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'University created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'University of Example' },
        location: { type: 'string', example: 'Example City' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can create universities' })
  async create(@Body() createUniversityDto: CreateUniversityDto): Promise<University> {
    return this.universitiesService.create(createUniversityDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update university by ID',
    description: 'Updates a specific university by its ID. Only admins can update universities.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'University updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'University of Example' },
        location: { type: 'string', example: 'Example City' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can update universities' })
  async update(
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ): Promise<University> {
    return this.universitiesService.update(id, updateUniversityDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete university by ID',
    description: 'Deletes a specific university by its ID. Only admins can delete universities.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'University deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'University deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can delete universities' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.universitiesService.remove(id);
    return { message: 'University deleted successfully' };
  }
}
