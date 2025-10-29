import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  async findAll(
    @Query('professor') professor?: string,
    @Query('user') user?: string,
    @Query('q') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return this.commentsService.findAll(professor, user, search, pageNum, limitNum);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ): Promise<Comment> {
    const studentId = req.user.id;
    return this.commentsService.create(createCommentDto, studentId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ): Promise<Comment> {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.commentsService.update(id, updateCommentDto, userId, userRole);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    const userRole = req.user.role;
    await this.commentsService.remove(id, userId, userRole);
    return { message: 'Comment deleted successfully' };
  }

  @Public()
  @Get('professor/:professorId/rating')
  async getProfessorRating(@Param('professorId') professorId: string) {
    return this.commentsService.getProfessorAverageRating(professorId);
  }
}
