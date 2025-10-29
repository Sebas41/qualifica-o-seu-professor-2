import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Test endpoint',
    description: 'Public test endpoint to verify the API is working'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Test successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Test controller working' }
      }
    }
  })
  getTest() {
    return { message: 'Test controller working' };
  }

  @Public()
  @Post()
  @ApiOperation({ 
    summary: 'Test POST endpoint',
    description: 'Public test POST endpoint to verify the API is working'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Test POST successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Test POST working' },
        body: { type: 'object' }
      }
    }
  })
  postTest(@Body() body: any) {
    return { message: 'Test POST working', body };
  }
}

