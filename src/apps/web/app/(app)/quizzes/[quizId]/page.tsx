"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuiz, useQuizQuestions, useSubmitQuiz } from "@/features/quizzes/hooks/useQuizzes";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { QuizTake } from "@/components/quiz/quiz-take";
import { QuizResults } from "@/components/quiz/quiz-results";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Send, Clock } from "lucide-react";
import Link from "next/link";
import type { QuizResult } from "@/types/quizzes.types";

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  return <QuizTakeAsync params={params} />;
}

function QuizTakeAsync({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = React.use(params);
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user.data?.id ?? "";

  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: questions, isLoading: questionsLoading } = useQuizQuestions(quizId);
  const submit = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [result, setResult] = React.useState<QuizResult | null>(null);

  const isLoading = quizLoading || questionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Quiz not found</p>
          <Button asChild className="mt-4">
            <Link href="/quizzes">Back to quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/quizzes">← Back to quizzes</Link>
          </Button>
        </div>
        <QuizResults
          result={result}
          onRetry={() => {
            setSubmitted(false);
            setResult(null);
            setAnswers({});
            setCurrentIndex(0);
          }}
        />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answerCount = Object.keys(answers).length;
  const progressPct = Math.round((answerCount / questions.length) * 100);

  function handleAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleSubmit() {
    if (!userId) return;
    const answerList = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    const attempt = await submit.mutateAsync({
      quizId,
      answers: answerList,
    });

    const correctCount = attempt.answers.filter((a: any) => a.correct).length;
    const incorrectCount = attempt.answers.filter((a: any) => !a.correct && a.answer !== "").length;
    const unansweredCount = questions.length - attempt.answers.filter((a: any) => a.answer !== "").length;

    setResult({
      attempt,
      quiz,
      questions,
      correctCount,
      incorrectCount,
      unansweredCount,
    });
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/quizzes">← Back to quizzes</Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{quiz.subjectName}</p>
          </div>
          {quiz.timeLimitMinutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{quiz.timeLimitMinutes} min</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{answerCount} / {questions.length} answered</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-lg border bg-card p-6">
        <QuizTake
          questions={questions}
          answers={answers}
          onAnswer={handleAnswer}
          currentIndex={currentIndex}
        />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submit.isPending}
            size="sm"
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            {submit.isPending ? "Submitting…" : "Submit Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}