"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Flashcard, ReviewRating } from "@/types/flashcards.types";

interface FlashcardStudyProps {
  cards: Flashcard[];
  deckName: string;
  onReview: (cardId: string, rating: ReviewRating) => Promise<void>;
}

export function FlashcardStudy({ cards, deckName, onReview }: FlashcardStudyProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const total = cards.length;
  const card = cards[current];
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    if (total > 0 && completed >= total && reviewed.size >= total) {
      // done
    }
  }, [completed, reviewed.size, total]);

  if (!card || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RefreshCw className="h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-xl font-bold">All done!</h2>
        <p className="mt-1 text-muted-foreground">
          You reviewed all {total} cards. Come back later for more.
        </p>
      </div>
    );
  }

  async function handleRate(rating: ReviewRating) {
    await onReview(card.id, rating);
    setFlipped(false);
    setReviewed((prev) => new Set(prev).add(card.id));
    setCompleted((c) => c + 1);

    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      // loop back for more review
      const next = cards.findIndex((c, i) => i > current && !reviewed.has(c.id));
      if (next !== -1) {
        setCurrent(next);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{deckName}</span>
          <span>{completed} / {total} reviewed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative min-h-64 cursor-pointer perspective-1000",
          flipped && "flipped"
        )}
        onClick={() => setFlipped((f) => !f)}
      >
        <Card
          className={cn(
            "flex min-h-64 flex-col items-center justify-center p-8 text-center transition-all duration-300",
            !flipped
              ? "bg-card hover:border-primary/50"
              : "bg-primary/5 border-primary/30"
          )}
        >
          {!flipped ? (
            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed">{card.front}</p>
              <p className="text-xs text-muted-foreground">Tap to reveal</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">{card.back}</p>
              {card.hint && (
                <p className="text-xs text-muted-foreground italic">Hint: {card.hint}</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Rating buttons — only show when flipped */}
      {flipped ? (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); handleRate("again"); }}
          >
            Again
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); handleRate("hard"); }}
          >
            Hard
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); handleRate("good"); }}
          >
            Good
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); handleRate("easy"); }}
          >
            Easy
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setFlipped(true)}>
          Show Answer
        </Button>
      )}
    </div>
  );
}