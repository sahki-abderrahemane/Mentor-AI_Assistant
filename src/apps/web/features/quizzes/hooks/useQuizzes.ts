"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quiz.service";
import type { ListQuizzesParams } from "@/services/quiz.service";

export const quizKeys = {
  all: ["quizzes"] as const,
  list: (params?: ListQuizzesParams) => [...quizKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...quizKeys.all, "detail", id] as const,
  questions: (id: string) => [...quizKeys.all, "questions", id] as const,
  attempts: (quizId: string) => [...quizKeys.all, "attempts", quizId] as const,
};

export function useQuizzes(params?: ListQuizzesParams) {
  return useQuery({
    queryKey: quizKeys.list(params),
    queryFn: () => quizService.list(params),
  });
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizService.get(id),
    enabled: Boolean(id),
  });
}

export function useQuizQuestions(quizId: string) {
  return useQuery({
    queryKey: quizKeys.questions(quizId),
    queryFn: () => quizService.getQuestions(quizId),
    enabled: Boolean(quizId),
  });
}

export function useQuizAttempts(quizId: string) {
  return useQuery({
    queryKey: quizKeys.attempts(quizId),
    queryFn: () => quizService.listAttempts(quizId),
    enabled: Boolean(quizId),
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: Array<{ questionId: string; answer: string | string[] }>;
    }) => quizService.submit(quizId, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizKeys.all });
    },
  });
}
