import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async findAll(
    @Query('university') university?: string,
    @Query('q') search?: string,
  ): Promise<Professor[]> {
    return this.professorsService.findAll(university, search);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Professor> {
    return this.professorsService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createProfessorDto: CreateProfessorDto): Promise<Professor> {
    return this.professorsService.create(createProfessorDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfessorDto: UpdateProfessorDto,
  ): Promise<Professor> {
    return this.professorsService.update(id, updateProfessorDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.professorsService.remove(id);
    return { message: 'Professor deleted successfully' };
  }
}
