import { Injectable, NotFoundException } from '@nestjs/common';
import { LearningService } from '../learning/learning.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { FlashcardDeck, Flashcard, FlashcardReview, ReviewRating } from './entities/flashcard.entity.js';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardDeck) private decks: Repository<FlashcardDeck>,
    @InjectRepository(Flashcard) private cards: Repository<Flashcard>,
    @InjectRepository(FlashcardReview) private reviews: Repository<FlashcardReview>,
    private learning: LearningService,
  ) {}

  async findAllDecks(params: { page?: number; pageSize?: number; subjectId?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.decks.createQueryBuilder('deck');
    if (params.subjectId) qb.andWhere('deck.subjectId = :subjectId', { subjectId: params.subjectId });
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    const ids = items.map((d) => d.id);
    let withCounts = items;
    if (ids.length > 0) {
      try {
        const now = new Date();
        const counts = await this.cards
          .createQueryBuilder('card')
          .select('card.deckId', 'deckId')
          .addSelect('COUNT(card.id)', 'cardCount')
          .addSelect("SUM(CASE WHEN card.nextReview <= :now THEN 1 ELSE 0 END)", 'dueToday')
          .addSelect("SUM(CASE WHEN card.interval >= 21 THEN 1 ELSE 0 END)", 'masteredCount')
          .where('card.deckId IN (:...ids)', { ids })
          .setParameter('now', now)
          .groupBy('card.deckId')
          .getRawMany<{ deckId: string; cardCount: string; dueToday: string; masteredCount: string }>();
        const byDeck = new Map(counts.map((c) => [c.deckId, c]));
        withCounts = items.map((deck) => {
          const c = byDeck.get(deck.id);
          return {
            ...deck,
            cardCount: Number(c?.cardCount ?? 0),
            dueToday: Number(c?.dueToday ?? 0),
            masteredCount: Number(c?.masteredCount ?? 0),
          };
        });
      } catch {
        withCounts = items;
      }
    }
    return { items: withCounts, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async findDeckById(id: string) {
    const deck = await this.decks.findOne({ where: { id }, relations: ['cards'] });
    if (!deck) throw new NotFoundException('Deck not found');
    return deck;
  }

  async getCards(deckId: string) {
    return this.cards.find({ where: { deckId }, order: { order: 'ASC' } });
  }

  async getDueCards(deckId?: string, userId?: string) {
    const now = new Date();
    const qb = this.cards.createQueryBuilder('card').where('card.nextReview <= :now', { now });
    if (deckId) qb.andWhere('card.deckId = :deckId', { deckId });
    // Only cards this user has studied before, plus brand-new cards nobody
    // has reviewed yet.
    if (userId) {
      qb.andWhere(
        `(card.id NOT IN (SELECT r."cardId" FROM flashcard_reviews r)` +
        ` OR card.id IN (SELECT r2."cardId" FROM flashcard_reviews r2 WHERE r2."userId" = :userId))`,
        { userId },
      );
    }
    qb.orderBy('card.nextReview', 'ASC').take(50);
    return qb.getMany();
  }

  async reviewCard(userId: string, cardId: string, rating: ReviewRating) {
    const card = await this.cards.findOne({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');

    // SM-2 Algorithm
    let { easeFactor, interval, repetitions } = card;

    if (rating === 'again') {
      interval = 1;
      repetitions = 0;
    } else {
      repetitions += 1;
      if (rating === 'easy') {
        interval = Math.round(interval * easeFactor * 1.3);
        easeFactor = Math.min(3.0, easeFactor + 0.15);
      } else if (rating === 'good') {
        interval = Math.round(interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + 0.05);
      } else {
        interval = Math.max(1, Math.round(interval * 0.8));
        easeFactor = Math.max(1.3, easeFactor - 0.15);
      }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    await this.cards.update(cardId, { easeFactor, interval, repetitions, nextReview });

    const review = this.reviews.create({
      cardId, userId, rating, easeFactor, interval,
    });
    await this.reviews.save(review);

    // Learning engine: count the review toward the deck's subject mastery.
    try {
      const deck = await this.decks.findOne({ where: { id: card.deckId } });
      await this.learning.recordCardReview(userId, deck?.subjectName ?? 'General');
    } catch {
      // learning side-effects must not fail the review
    }

    return { easeFactor, interval, repetitions, nextReview };
  }
}