import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@ApiBearerAuth()
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Execute database seed',
    description: 'Creates massive test data: 100 users, 80 universities, 150 professors, 400 comments using Faker.js. By default, overwrites existing data. Use force=false to skip if data exists.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        force: { type: 'boolean', example: true, description: 'Force seed even if data exists. This will delete existing data first. Default: true' }
      }
    },
    required: false
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Seed executed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Seed ejecutado exitosamente' },
        data: {
          type: 'object',
          properties: {
            admin: { 
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                email: { type: 'string', example: 'admin@example.com' }
              }
            },
            universities: { type: 'number', example: 80 },
            professors: { type: 'number', example: 150 },
            students: { type: 'number', example: 99 },
            comments: { type: 'number', example: 400 }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Database already contains data',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'La base de datos ya contiene datos. Omitiendo seed.' },
        data: {
          type: 'object',
          properties: {
            existingUsers: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async executeSeed(@Body('force') force?: boolean) {
    // Si force no se especifica (undefined), usar true por defecto
    const shouldForce = force === undefined ? true : force === true;
    return this.seedService.executeSeed(shouldForce);
  }

  @Roles(UserRole.ADMIN)
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Execute database unseed',
    description: 'Removes ALL data from the database: comments, professors, universities and all users (including admin).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unseed executed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unseed ejecutado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executeUnseed() {
    return this.seedService.executeUnseed();
  }
}
