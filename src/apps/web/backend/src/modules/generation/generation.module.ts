import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeUnit, Document } from '../documents/entities/document.entity.js';
import { Collection } from '../projects/entities/index.js';
import { Quiz, Question } from '../quizzes/entities/quiz.entity.js';
import { FlashcardDeck, Flashcard } from '../flashcards/entities/flashcard.entity.js';
import { StudyGuide } from '../learning/entities/learning.entity.js';
import { AiProxyModule } from '../../shared/ai-proxy/ai-proxy.module.js';
import { GenerationController } from './generation.controller.js';
import { GenerationService } from './generation.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeUnit, Document, Collection,
      Quiz, Question, FlashcardDeck, Flashcard, StudyGuide,
    ]),
    AiProxyModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
