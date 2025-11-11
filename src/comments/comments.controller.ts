import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ 
    summary: 'Get all comments',
    description: 'Retrieves a list of all comments with optional filtering and pagination. This endpoint is public.'
  })
  @ApiQuery({ name: 'professor', required: false, description: 'Filter by professor ID' })
  @ApiQuery({ name: 'user', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by comment content' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              content: { type: 'string', example: 'Great professor!' },
              rating: { type: 'number', example: 5 },
              professor: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  name: { type: 'string', example: 'Dr. John Smith' },
                  department: { type: 'string', example: 'Computer Science' }
                }
              },
              student: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' }
                }
              },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
            }
          }
        },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        total: { type: 'number', example: 100 }
      }
    }
  })
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
  @Get('professor/:professorId/comments')
  @ApiOperation({ 
    summary: 'Get all comments for a professor',
    description: 'Retrieves all comments for a specific professor. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Professor comments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          content: { type: 'string', example: 'Great professor!' },
          rating: { type: 'number', example: 5 },
          professor: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              name: { type: 'string', example: 'Dr. John Smith' },
              department: { type: 'string', example: 'Computer Science' }
            }
          },
          student: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' }
            }
          },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
        }
      }
    }
  })
  async getProfessorComments(@Param('professorId') professorId: string): Promise<Comment[]> {
    return this.commentsService.findByProfessor(professorId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get comment by ID',
    description: 'Retrieves a specific comment by its ID. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        content: { type: 'string', example: 'Great professor!' },
        rating: { type: 'number', example: 5 },
        professor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Dr. John Smith' },
            department: { type: 'string', example: 'Computer Science' }
          }
        },
        student: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new comment',
    description: 'Creates a new comment/rating for a professor. Students can only comment once per professor.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Comment created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        content: { type: 'string', example: 'Great professor!' },
        rating: { type: 'number', example: 5 },
        professor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Dr. John Smith' },
            department: { type: 'string', example: 'Computer Science' }
          }
        },
        student: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'You have already commented and rated this professor' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ): Promise<Comment> {
    const studentId = req.user.id;
    return this.commentsService.create(createCommentDto, studentId);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update comment by ID',
    description: 'Updates a specific comment by its ID. Only the comment owner or admins can update comments.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        content: { type: 'string', example: 'Great professor!' },
        rating: { type: 'number', example: 5 },
        professor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Dr. John Smith' },
            department: { type: 'string', example: 'Computer Science' }
          }
        },
        student: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' }
          }
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the comment owner or admin can update it' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @ApiOperation({ 
    summary: 'Delete comment by ID',
    description: 'Deletes a specific comment by its ID. Only the comment owner or admins can delete comments.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Comment deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the comment owner or admin can delete it' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
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
  @ApiOperation({ 
    summary: 'Get professor average rating',
    description: 'Retrieves the average rating and total number of comments for a specific professor. This endpoint is public.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Professor rating retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number', example: 4.5 },
        totalComments: { type: 'number', example: 25 }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Professor not found or no ratings available' })
  async getProfessorRating(@Param('professorId') professorId: string) {
    return this.commentsService.getProfessorAverageRating(professorId);
  }
}
