import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entities/professor.entity';
import { ProfessorsController } from './professors.controller';
import { ProfessorsService } from './professors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Professor])],
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  exports: [ProfessorsService],
})
export class ProfessorsModule {}
