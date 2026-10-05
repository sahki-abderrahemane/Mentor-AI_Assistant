"use client";

import Link from "next/link";
import { Layers, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FlashcardDeck } from "@/types/flashcards.types";

interface FlashcardDeckCardProps {
  deck: {
    id: string;
    name: string;
    description?: string;
    cardCount: number;
    masteredCount: number;
    dueToday: number;
  };
}

export function FlashcardDeckCard({ deck }: FlashcardDeckCardProps) {
  const masteryPct = deck.cardCount > 0
    ? Math.round((deck.masteredCount / deck.cardCount) * 100)
    : 0;

  return (
    <Link href={`/flashcards/${deck.id}`}>
      <Card className="group cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex gap-2">
            {deck.dueToday > 0 && (
              <Badge variant="warning" className="text-xs">
                {deck.dueToday} due
              </Badge>
            )}
          </div>
        </div>

        <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary">
          {deck.name}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
          {deck.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{deck.cardCount} cards</span>
            <span>{masteryPct}% mastered</span>
          </div>
          <Progress value={masteryPct} className="h-1.5" />
        </div>
      </Card>
    </Link>
  );
}