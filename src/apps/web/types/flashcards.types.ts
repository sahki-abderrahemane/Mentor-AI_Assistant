import type { AuditFields } from "./api.types";

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  order: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  subjectName: string;
  cardCount: number;
  masteredCount: number;
  dueToday: number;
  lastStudied?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewCardInput {
  cardId: string;
  rating: ReviewRating;
}

export interface DeckProgress {
  deckId: string;
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
  dueToday: number;
}