import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { QuizzesService } from './quizzes.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzes: QuizzesService) {}

  @Get()
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('subjectId') subjectId?: string,
    @Query('status') status?: string,
  ) {
    return this.quizzes.findAll({ page, pageSize, subjectId, status });
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzes.findById(id);
  }

  @Get(':id/questions')
  questions(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzes.getQuestions(id);
  }

  @Get(':id/attempts')
  attempts(@Param('id', ParseUUIDPipe) id: string) {
    return this.quizzes.getAttempts(id);
  }

  @Post(':id/attempts')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { answers: Array<{ questionId: string; answer: string }> },
  ) {
    return this.quizzes.submit(user.id, id, body.answers);
  }
}