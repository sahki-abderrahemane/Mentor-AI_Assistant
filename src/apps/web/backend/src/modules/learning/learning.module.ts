import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  StudyGuide, StudySession, LearningStreak,
  TopicMastery, Achievement, UserAchievement,
} from './entities/learning.entity.js';
import { QuizAttempt } from '../quizzes/entities/quiz.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Conversation } from '../chat/entities/chat.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { LearningController } from './learning.controller.js';
import { LearningService } from './learning.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([
    StudyGuide, StudySession, LearningStreak,
    TopicMastery, Achievement, UserAchievement,
    QuizAttempt, Document, Conversation,
  ]), NotificationsModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}