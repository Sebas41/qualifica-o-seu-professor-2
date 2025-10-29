import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Ejecutar seed de la base de datos' })
  @ApiResponse({ status: 201, description: 'Seed ejecutado exitosamente' })
  @ApiResponse({ status: 400, description: 'La base de datos ya contiene datos' })
  async executeSeed() {
    await this.seedService.executeSeed();
    return {
      message: 'Seed ejecutado exitosamente',
      credentials: {
        admin: {
          email: 'admin@example.com',
          password: 'admin123',
        },
        users: {
          email: 'user0@example.com hasta user99@example.com',
          password: 'password123',
        },
      },
    };
  }
}
