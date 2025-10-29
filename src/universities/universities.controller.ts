import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async findAll(): Promise<University[]> {
    return this.universitiesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<University> {
    return this.universitiesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUniversityDto: CreateUniversityDto): Promise<University> {
    return this.universitiesService.create(createUniversityDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ): Promise<University> {
    return this.universitiesService.update(id, updateUniversityDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.universitiesService.remove(id);
    return { message: 'University deleted successfully' };
  }
}
