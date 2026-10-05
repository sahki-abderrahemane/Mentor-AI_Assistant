"use client";

import * as React from "react";
import { useDeck, useDeckCards, useDueCards, useReviewCard } from "@/features/flashcards/hooks/useFlashcards";
import { FlashcardStudy } from "@/components/flashcard/flashcard-study";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReviewRating } from "@/types/flashcards.types";

export default function FlashcardStudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  return <FlashcardStudyAsync params={params} />;
}

function FlashcardStudyAsync({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = React.use(params);
  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: allCards, isLoading: cardsLoading } = useDeckCards(deckId);
  const { data: dueCards } = useDueCards(deckId);
  const reviewCard = useReviewCard();

  const isLoading = deckLoading || cardsLoading;

  async function handleReview(cardId: string, rating: ReviewRating) {
    await reviewCard.mutateAsync({ cardId, rating });
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Deck not found</p>
          <Button asChild className="mt-4">
            <Link href="/flashcards">Back to flashcards</Link>
          </Button>
        </div>
      </div>
    );
  }

  const studyCards = dueCards && dueCards.length > 0 ? dueCards : (allCards ?? []);

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/flashcards">← Back to decks</Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{deck.name}</h1>
            <p className="text-sm text-muted-foreground">{deck.subjectName}</p>
          </div>
          {dueCards && dueCards.length > 0 && (
            <Badge variant="warning" className="text-xs">
              {dueCards.length} due today
            </Badge>
          )}
        </div>
      </div>

      <FlashcardStudy
        cards={studyCards}
        deckName={deck.name}
        onReview={handleReview}
      />
    </div>
  );
}