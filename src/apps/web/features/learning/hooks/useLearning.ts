"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningService } from "@/services/learning.service";

export const learningKeys = {
  all: ["learning"] as const,
  progress: () => [...learningKeys.all, "progress"] as const,
  streak: () => [...learningKeys.all, "streak"] as const,
  mastery: () => [...learningKeys.all, "mastery"] as const,
  achievements: () => [...learningKeys.all, "achievements"] as const,
};

export function useProgress() {
  return useQuery({
    queryKey: learningKeys.progress(),
    queryFn: () => learningService.getProgress(),
    staleTime: 1000 * 30,
  });
}

export function useStreak() {
  return useQuery({
    queryKey: learningKeys.streak(),
    queryFn: () => learningService.getStreak(),
    staleTime: 1000 * 60,
  });
}

export function useTopicMastery() {
  return useQuery({
    queryKey: learningKeys.mastery(),
    queryFn: () => learningService.getTopicMastery(),
    staleTime: 1000 * 60,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: learningKeys.achievements(),
    queryFn: () => learningService.getAchievements(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStartSession() {
  return useMutation({
    mutationFn: learningService.startSession,
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { durationMinutes: number } }) =>
      learningService.endSession(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: learningKeys.all });
    },
  });
}
