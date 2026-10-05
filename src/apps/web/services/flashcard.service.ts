import {
  mockFlashcardDecks,
  mockFlashcards,
  getMockDeck,
  getMockDeckCards,
  getDueCards,
  type MockFlashcardDeck,
  type MockFlashcard,
} from "@/mock/flashcards/data";
import { getApiClient } from "@/lib/api";
import { paginate } from "@/mock/seed";
import type { ReviewRating } from "@/types/flashcards.types";

export interface ListDecksParams {
  page?: number;
  pageSize?: number;
  subjectId?: string;
}

export const flashcardService = {
  list(params: ListDecksParams = {}) {
    const c = getApiClient();
    if (c.kind === "mock") {
      let items = [...mockFlashcardDecks];
      if (params.subjectId) {
        items = items.filter((d) => d.subjectId === params.subjectId);
      }
      return Promise.resolve(paginate(items, params.page ?? 1, params.pageSize ?? 20));
    }
    return c.real.get("/flashcards/decks", { params }).then((r) => r.data);
  },

  getDeck(id: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getMockDeck(id) ?? null);
    }
    return c.real.get(`/flashcards/decks/${id}`).then((r) => r.data);
  },

  getCards(deckId: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getMockDeckCards(deckId));
    }
    return c.real.get(`/flashcards/decks/${deckId}/cards`).then((r) => r.data);
  },

  getDue(deckId?: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getDueCards(deckId));
    }
    return c.real.get("/flashcards/due", { params: { deckId } }).then((r) => r.data);
  },

  review(cardId: string, rating: ReviewRating) {
    const c = getApiClient();
    if (c.kind === "mock") {
      const card = mockFlashcards.find((x) => x.id === cardId);
      if (!card) return Promise.reject(new Error("Card not found"));

      let newEF = card.easeFactor;
      let newInterval = card.interval;
      let newReps = card.repetitions;

      if (rating === "again") {
        newInterval = 1;
        newReps = 0;
      } else {
        newReps = card.repetitions + 1;
        if (rating === "easy") {
          newInterval = Math.round(card.interval * card.easeFactor * 1.3);
          newEF = Math.min(3.0, card.easeFactor + 0.15);
        } else if (rating === "good") {
          newInterval = Math.round(card.interval * card.easeFactor);
          newEF = Math.max(1.3, card.easeFactor + 0.05);
        } else {
          newInterval = Math.max(1, Math.round(card.interval * 0.8));
          newEF = Math.max(1.3, card.easeFactor - 0.15);
        }
      }

      card.easeFactor = newEF;
      card.interval = newInterval;
      card.repetitions = newReps;
      card.nextReview = new Date(
        Date.now() + newInterval * 86_400_000
      ).toISOString();

      return Promise.resolve({ ...card });
    }
    return c.real.post(`/flashcards/cards/${cardId}/review`, { rating }).then((r) => r.data);
  },
};

void mockFlashcardDecks;
void mockFlashcards;
void getDueCards;