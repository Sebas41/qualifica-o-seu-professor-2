import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { SeedService } from './seed.service';

@ApiTags('seed')
@ApiBearerAuth()
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  runSeed() {
    return this.seedService.runSeed();
  }
}
