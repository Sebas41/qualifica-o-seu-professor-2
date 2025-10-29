import { Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post('run')
  async run() {
    return this.seedService.run();
  }
}
