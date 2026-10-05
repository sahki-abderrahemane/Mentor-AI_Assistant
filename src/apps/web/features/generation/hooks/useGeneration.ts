"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generationService } from "@/services/generation.service";
import type {
  GenerateFlashcardsInput,
  GenerateQuizInput,
  GenerateStudyGuideInput,
} from "@/services/generation.service";
import { quizKeys } from "@/features/quizzes/hooks/useQuizzes";
import { flashcardKeys } from "@/features/flashcards/hooks/useFlashcards";
import { studyguideKeys } from "@/features/studyguides/hooks/useStudyGuides";

export function useGenerateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateQuizInput) => generationService.generateQuiz(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizKeys.all });
    },
  });
}

export function useGenerateFlashcards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateFlashcardsInput) => generationService.generateFlashcards(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: flashcardKeys.all });
    },
  });
}

export function useGenerateStudyGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateStudyGuideInput) => generationService.generateStudyGuide(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studyguideKeys.all });
    },
  });
}
