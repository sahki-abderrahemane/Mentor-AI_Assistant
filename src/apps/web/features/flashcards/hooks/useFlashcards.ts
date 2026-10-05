"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardService } from "@/services/flashcard.service";
import type { ReviewRating } from "@/types/flashcards.types";
import type { ListDecksParams } from "@/services/flashcard.service";

export const flashcardKeys = {
  all: ["flashcards"] as const,
  decks: (params?: ListDecksParams) => [...flashcardKeys.all, "decks", params ?? {}] as const,
  deck: (id: string) => [...flashcardKeys.all, "deck", id] as const,
  cards: (deckId: string) => [...flashcardKeys.all, "cards", deckId] as const,
  due: (deckId?: string) => [...flashcardKeys.all, "due", deckId ?? "all"] as const,
};

export function useDecks(params?: ListDecksParams) {
  return useQuery({
    queryKey: flashcardKeys.decks(params),
    queryFn: () => flashcardService.list(params),
  });
}

export function useDeck(id: string) {
  return useQuery({
    queryKey: flashcardKeys.deck(id),
    queryFn: () => flashcardService.getDeck(id),
    enabled: Boolean(id),
  });
}

export function useDeckCards(deckId: string) {
  return useQuery({
    queryKey: flashcardKeys.cards(deckId),
    queryFn: () => flashcardService.getCards(deckId),
    enabled: Boolean(deckId),
  });
}

export function useDueCards(deckId?: string) {
  return useQuery({
    queryKey: flashcardKeys.due(deckId),
    queryFn: () => flashcardService.getDue(deckId),
    staleTime: 0,
  });
}

export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, rating }: { cardId: string; rating: ReviewRating }) =>
      flashcardService.review(cardId, rating),
    onSuccess: (_data, { cardId }) => {
      qc.invalidateQueries({ queryKey: flashcardKeys.all });
    },
  });
}