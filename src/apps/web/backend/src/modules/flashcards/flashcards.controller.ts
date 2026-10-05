import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private flashcards: FlashcardsService) {}

  @Get('decks')
  listDecks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.flashcards.findAllDecks({ page, pageSize, subjectId });
  }

  @Get('decks/:id')
  getDeck(@Param('id', ParseUUIDPipe) id: string) {
    return this.flashcards.findDeckById(id);
  }

  @Get('decks/:id/cards')
  getCards(@Param('id', ParseUUIDPipe) id: string) {
    return this.flashcards.getCards(id);
  }

  @Get('due')
  getDue(@Query('deckId') deckId?: string) {
    return this.flashcards.getDueCards(deckId);
  }

  @Post('cards/:id/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { rating: 'again' | 'hard' | 'good' | 'easy' },
  ) {
    return this.flashcards.reviewCard(user.id, id, body.rating);
  }
}