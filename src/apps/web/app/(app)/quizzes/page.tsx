"use client";

import { useState } from "react";
import { Brain, Sparkles } from "lucide-react";
import { useQuizzes } from "@/features/quizzes/hooks/useQuizzes";
import { QuizCard } from "@/components/quiz/quiz-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GenerateDialog } from "@/features/generation/components/generate-dialog";
import { useDocuments } from "@/features/documents/hooks/useDocuments";

export default function QuizzesPage() {
  const { data, isLoading } = useQuizzes({ pageSize: 50 });
  const { data: documentsData } = useDocuments({ pageSize: 100 });
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quizzes</h1>
            <p className="text-sm text-muted-foreground">Test your knowledge and track progress</p>
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
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">No quizzes available</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quizzes will appear here once sources are added to your subjects.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((quiz: any) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
            />
          ))}
        </div>
      )}

      <GenerateDialog
        kind="quiz"
        documents={(documentsData?.items ?? []).map((d: { id: string; title: string }) => ({ id: d.id, title: d.title }))}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </div>
  );
}