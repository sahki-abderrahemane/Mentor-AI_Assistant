"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Question, QuestionOption } from "@/types/quizzes.types";

interface QuizQuestionProps {
  question: Question;
  selectedAnswer?: string | string[];
  onSelect: (answer: string) => void;
  showCorrect?: boolean;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onSelect,
  showCorrect = false,
}: QuizQuestionProps) {
  const isAnswered = selectedAnswer !== undefined;
  const singleSelected = Array.isArray(selectedAnswer)
    ? selectedAnswer[0]
    : selectedAnswer;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-1 shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Q{question.order}
        </span>
        <p className="text-base leading-relaxed font-medium">{question.text}</p>
      </div>

      <div className="space-y-2.5 pl-1">
        {question.options?.map((opt) => {
          const isSelected = singleSelected === opt.text;
          const isCorrectOption = opt.isCorrect;

          let icon = <Circle className="h-5 w-5 text-muted-foreground" />;
          if (isSelected && !showCorrect) {
            icon = (
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            );
          } else if (showCorrect && isCorrectOption) {
            icon = <CheckCircle className="h-5 w-5 text-green-600" />;
          } else if (showCorrect && isSelected && !isCorrectOption) {
            icon = <XCircle className="h-5 w-5 text-destructive" />;
          } else if (showCorrect && isCorrectOption) {
            icon = <CheckCircle className="h-5 w-5 text-green-600" />;
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => !showCorrect && onSelect(opt.text)}
              disabled={showCorrect}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                isSelected && !showCorrect
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent",
                showCorrect && isCorrectOption && "border-green-500 bg-green-500/5",
                showCorrect && isSelected && !isCorrectOption && "border-destructive bg-destructive/5"
              )}
            >
              {icon}
              <span className="flex-1">{opt.text}</span>
              {showCorrect && isCorrectOption && (
                <span className="text-xs font-medium text-green-600">Correct</span>
              )}
              {showCorrect && isSelected && !isCorrectOption && (
                <span className="text-xs font-medium text-destructive">Your answer</span>
              )}
            </button>
          );
        })}
      </div>

      {showCorrect && question.explanation && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="font-medium text-blue-800 dark:text-blue-200">Explanation</p>
          <p className="mt-1 text-blue-700 dark:text-blue-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}