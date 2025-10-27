import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from '../professors/entities/professor.entity';
import { ProfessorsModule } from '../professors/professors.module';
import { Rating } from '../ratings/entities/rating.entity';
import { RatingsModule } from '../ratings/ratings.module';
import { UsersModule } from '../users/users.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professor, Rating]),
    UsersModule,
    ProfessorsModule,
    RatingsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
