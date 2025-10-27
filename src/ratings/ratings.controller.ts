import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@ApiBearerAuth()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Post()
  create(@Body() createRatingDto: CreateRatingDto, @Req() req: Request) {
    return this.ratingsService.create(createRatingDto, (req.user as any).id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.ratingsService.findAll();
  }

  @Public()
  @Get('professor/:id')
  findByProfessor(@Param('id') professorId: string) {
    return this.ratingsService.findByProfessor(professorId);
  }

  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto, @Req() req: Request) {
    const user = req.user as any;
    return this.ratingsService.update(id, updateRatingDto, { id: user.id, role: user.role });
  }

  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.ratingsService.remove(id, { id: user.id, role: user.role });
  }
}
