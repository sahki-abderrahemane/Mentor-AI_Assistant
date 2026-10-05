import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { GenerationService } from './generation.service.js';
import { GenerateFlashcardsDto, GenerateQuizDto, GenerateStudyGuideDto } from './generation.dto.js';

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private generation: GenerationService) {}

  @Post('quiz')
  generateQuiz(@CurrentUser() user: { id: string }, @Body() dto: GenerateQuizDto) {
    return this.generation.generateQuiz(user.id, dto);
  }

  @Post('flashcards')
  generateFlashcards(@CurrentUser() user: { id: string }, @Body() dto: GenerateFlashcardsDto) {
    return this.generation.generateFlashcards(user.id, dto);
  }

  @Post('study-guide')
  generateStudyGuide(@CurrentUser() user: { id: string }, @Body() dto: GenerateStudyGuideDto) {
    return this.generation.generateStudyGuide(user.id, dto);
  }
}
