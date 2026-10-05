"use client";

import { QuizQuestion } from "./quiz-question";
import type { Question } from "@/types/quizzes.types";

interface QuizTakeProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  currentIndex: number;
}

export function QuizTake({ questions, answers, onAnswer, currentIndex }: QuizTakeProps) {
  const current = questions[currentIndex];
  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>
          {Object.keys(answers).length} answered
        </span>
      </div>
      <QuizQuestion
        question={current}
        selectedAnswer={answers[current.id]}
        onSelect={(ans) => onAnswer(current.id, ans)}
      />
    </div>
  );
}