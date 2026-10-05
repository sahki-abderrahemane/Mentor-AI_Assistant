import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardDeck, Flashcard, FlashcardReview } from './entities/flashcard.entity.js';
import { FlashcardsController } from './flashcards.controller.js';
import { FlashcardsService } from './flashcards.service.js';
import { LearningModule } from '../learning/learning.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardDeck, Flashcard, FlashcardReview]), LearningModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}