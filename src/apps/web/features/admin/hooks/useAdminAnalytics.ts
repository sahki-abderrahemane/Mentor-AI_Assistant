"use client";

import { useQuery } from "@tanstack/react-query";
import { adminAnalyticsService } from "@/services/admin-analytics.service";

export const adminAnalyticsKeys = {
  learningAnalytics: ["admin", "learning-analytics"] as const,
};

export function useLearningAnalytics() {
  return useQuery({
    queryKey: adminAnalyticsKeys.learningAnalytics,
    queryFn: () => adminAnalyticsService.learningAnalytics(),
    staleTime: 30_000,
  });
}