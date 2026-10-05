"use client";

import { Trophy, Target, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "./quiz-question";
import type { QuizResult } from "@/types/quizzes.types";

interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
}

export function QuizResults({ result, onRetry }: QuizResultsProps) {
  const { attempt, quiz, questions } = result;
  const percentage = attempt.percentage;
  const passed = attempt.passed;

  return (
    <div className="space-y-8">
      {/* Score hero */}
      <Card className="p-8 text-center">
        <div
          className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full mx-auto ${
            passed ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          <Trophy className="h-10 w-10" />
        </div>
        <h2 className="mb-1 text-2xl font-bold">
          {percentage}%
        </h2>
        <p className={`mb-4 text-sm font-medium ${passed ? "text-green-600" : "text-amber-600"}`}>
          {passed ? "Passed!" : "Keep practicing"}
        </p>
        <p className="text-sm text-muted-foreground">
          You answered {result.correctCount} of {questions.length} questions correctly.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            {result.correctCount} correct
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-destructive" />
            {result.incorrectCount} wrong
          </span>
          {result.unansweredCount > 0 && (
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {result.unansweredCount} skipped
            </span>
          )}
        </div>
        <Button onClick={onRetry} className="mt-6 gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </Button>
      </Card>

      {/* Detailed breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold">Question Review</h3>
        {questions.map((q, i) => {
          const answer = attempt.answers.find((a) => a.questionId === q.id);
          return (
            <Card key={q.id} className="p-5">
              <QuizQuestion
                question={q}
                selectedAnswer={answer?.answer}
                onSelect={() => {}}
                showCorrect
              />
              {!answer && (
                <p className="mt-3 text-xs text-muted-foreground">Not answered</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}