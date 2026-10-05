"use client";

import Link from "next/link";
import { Brain, Clock, Target, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Quiz, QuizAttempt } from "@/types/quizzes.types";

interface QuizCardProps {
  quiz: Quiz;
  bestAttempt?: QuizAttempt;
}

export function QuizCard({ quiz, bestAttempt }: QuizCardProps) {
  const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
    published: "success",
    draft: "warning",
    archived: "destructive",
  };

  return (
    <Link href={`/quizzes/${quiz.id}`}>
      <Card className="group cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <Badge variant={statusVariant[quiz.status] ?? "default"} className="text-xs">
            {quiz.status}
          </Badge>
        </div>

        <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary">
          {quiz.title}
        </h3>
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
          {quiz.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {quiz.questionCount} questions
          </span>
          {quiz.timeLimitMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {quiz.timeLimitMinutes} min
            </span>
          )}
          {bestAttempt && (
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Best: {bestAttempt.percentage}%
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}