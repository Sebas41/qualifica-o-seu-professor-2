import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Execute database seed',
    description: 'Creates massive test data: 100 users, 80 universities, 150 professors, 400 comments using Faker.js'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Seed ejecutado exitosamente',
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
    description: 'La base de datos ya contiene datos',
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
  async executeSeed() {
    return this.seedService.executeSeed();
  }

  @Public()
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Execute database unseed',
    description: 'Removes all data created by seed: comments, professors, universities and students. Keeps admin user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Unseed ejecutado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unseed ejecutado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async executeUnseed() {
    return this.seedService.executeUnseed();
  }
}
