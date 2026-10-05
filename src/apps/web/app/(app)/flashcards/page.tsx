"use client";

import { useState } from "react";
import { Layers, Sparkles } from "lucide-react";
import { useDecks } from "@/features/flashcards/hooks/useFlashcards";
import { FlashcardDeckCard } from "@/components/flashcard/flashcard-deck-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GenerateDialog } from "@/features/generation/components/generate-dialog";
import { useDocuments } from "@/features/documents/hooks/useDocuments";

export default function FlashcardsPage() {
  const { data, isLoading } = useDecks({ pageSize: 50 });
  const { data: documentsData } = useDocuments({ pageSize: 100 });
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Flashcards</h1>
            <p className="text-sm text-muted-foreground">Review with spaced repetition</p>
          </div>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate with AI
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">No flashcard decks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Flashcard decks will appear when you add sources to your subjects.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((deck: { id: string; name: string; description?: string; cardCount: number; masteredCount: number; dueToday: number }) => (
            <FlashcardDeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}

      <GenerateDialog
        kind="flashcards"
        documents={(documentsData?.items ?? []).map((d: { id: string; title: string }) => ({ id: d.id, title: d.title }))}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </div>
  );
}