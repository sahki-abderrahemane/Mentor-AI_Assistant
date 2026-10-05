import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz, Question, QuizAttempt, QuizAnswer } from './entities/quiz.entity.js';
import { QuizzesController } from './quizzes.controller.js';
import { QuizzesService } from './quizzes.service.js';
import { LearningModule } from '../learning/learning.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuizAttempt, QuizAnswer]), LearningModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}