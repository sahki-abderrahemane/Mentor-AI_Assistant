"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function FlashcardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Flashcards error</h2>
        <p className="text-sm text-muted-foreground">{error.message || "Failed to load flashcards."}</p>
      </div>
      <Button onClick={reset} variant="outline">Try again</Button>
    </div>
  );
}