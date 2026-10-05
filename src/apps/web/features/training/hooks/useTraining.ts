"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trainingService } from "@/services";
import type { TrainingFilters } from "@/types";

export const trainingKeys = {
  all: ["training"] as const,
  list: (filters: TrainingFilters) => ["training", "list", filters] as const,
  detail: (id: string) => ["training", "detail", id] as const,
};

export function useTrainingJobs(filters: TrainingFilters = {}) {
  return useQuery({
    queryKey: trainingKeys.list(filters),
    queryFn: () => trainingService.list({ ...filters }),
    refetchInterval: (q) => {
      const data = q.state.data;
      const hasActive = data?.items?.some((j: { status: string }) =>
        ["running", "preparing", "evaluating", "queued"].includes(j.status)
      );
      return hasActive ? 3000 : false;
    },
  });
}

export function useTrainingJob(id: string) {
  return useQuery({
    queryKey: trainingKeys.detail(id),
    queryFn: () => trainingService.get(id),
    enabled: Boolean(id),
    refetchInterval: (q) => {
      const data = q.state.data as { status?: string } | undefined;
      return data && ["running", "preparing", "evaluating", "queued"].includes(data.status ?? "")
        ? 3000
        : false;
    },
  });
}

export function useCancelTrainingJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: trainingKeys.all });
      qc.invalidateQueries({ queryKey: trainingKeys.detail(id) });
    },
  });
}

export function useCreateTrainingJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof trainingService.create>[0]) =>
      trainingService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useStartTrainingJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.start(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: trainingKeys.all });
      qc.invalidateQueries({ queryKey: trainingKeys.detail(id) });
    },
  });
}
