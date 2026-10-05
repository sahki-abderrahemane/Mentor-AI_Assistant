import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { LearningService } from './learning.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private learning: LearningService) {}

  @Get('streak')
  getStreak(@CurrentUser() user: { id: string }) {
    return this.learning.getStreak(user.id);
  }

  @Post('sessions')
  startSession(@CurrentUser() user: { id: string }, @Body() body: { type?: string; subjectId?: string; topicId?: string }) {
    return this.learning.startSession(user.id, body);
  }

  @Post('sessions/:id/end')
  endSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { durationMinutes: number },
  ) {
    return this.learning.endSession(user.id, id, body);
  }

  @Get('mastery')
  getMastery(@CurrentUser() user: { id: string }, @Query('topicId') topicId?: string) {
    return this.learning.getMastery(user.id, topicId);
  }

  @Get('achievements')
  getAchievements(@CurrentUser() user: { id: string }) {
    return this.learning.getAchievements(user.id);
  }

  @Get('achievements/all')
  getAllAchievements() {
    return this.learning.getAllAchievements();
  }

  @Get('progress')
  getProgress(@CurrentUser() user: { id: string }) {
    return this.learning.getProgress(user.id);
  }

  @Get('progress/:userId')
  getProgressByUser(@Param('userId') _userId: string, @CurrentUser() user: { id: string }) {
    return this.learning.getProgress(user.id);
  }
}