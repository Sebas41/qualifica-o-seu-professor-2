import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getTest() {
    return { message: 'Test controller working' };
  }

  @Post()
  postTest(@Body() body: any) {
    return { message: 'Test POST working', body };
  }
}

