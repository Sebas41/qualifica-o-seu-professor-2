import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Professor } from './entities/professor.entity';
import { ProfessorsService } from './professors.service';

@ApiTags('professors')
@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all professors',
    description: 'Retrieves a list of all professors with optional filtering by university and search query. This endpoint is public.'
  })
  @ApiQuery({ name: 'university', required: false, description: 'Filter by university ID' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by professor name or department' })
  @ApiResponse({ 
    status: 200, 
    description: 'Professors retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          name: { type: 'string', example: 'Dr. John Smith' },
          department: { type: 'string', example: 'Computer Science' },
          university: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              name: { type: 'string', example: 'University of Example' },
              location: { type: 'string', example: 'Example City' }
            }
          },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
        }
      }
    }
  })
  async findAll(
    @Query('university') university?: string,
    @Query('q') search?: string,
  ): Promise<Professor[]> {
    return this.professorsService.findAll(university, search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get professor by ID',
    description: 'Retrieves a specific professor by their ID. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Professor retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'Dr. John Smith' },
        department: { type: 'string', example: 'Computer Science' },
        university: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'University of Example' },
            location: { type: 'string', example: 'Example City' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  async findOne(@Param('id') id: string): Promise<Professor> {
    return this.professorsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ 
    summary: 'Create a new professor',
    description: 'Creates a new professor. Only admins can create professors.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Professor created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'Dr. John Smith' },
        department: { type: 'string', example: 'Computer Science' },
        university: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'University of Example' },
            location: { type: 'string', example: 'Example City' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can create professors' })
  async create(@Body() createProfessorDto: CreateProfessorDto): Promise<Professor> {
    return this.professorsService.create(createProfessorDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update professor by ID',
    description: 'Updates a specific professor by their ID. Only admins can update professors.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Professor updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'Dr. John Smith' },
        department: { type: 'string', example: 'Computer Science' },
        university: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'University of Example' },
            location: { type: 'string', example: 'Example City' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can update professors' })
  async update(
    @Param('id') id: string,
    @Body() updateProfessorDto: UpdateProfessorDto,
  ): Promise<Professor> {
    return this.professorsService.update(id, updateProfessorDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete professor by ID',
    description: 'Deletes a specific professor by their ID. Only admins can delete professors.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Professor deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Professor deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only admins can delete professors' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.professorsService.remove(id);
    return { message: 'Professor deleted successfully' };
  }
}
