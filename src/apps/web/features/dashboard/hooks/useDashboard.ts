"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  activity: () => [...dashboardKeys.all, "activity"] as const,
};

export interface DashboardStats {
  conversations: number;
  documents: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
}

/**
 * GET /dashboard/stats -> { conversations, documents, quizzesTaken }
 * Mock mode has no dashboard data source; return zeros instead of inventing data.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async (): Promise<DashboardStats | null> => {
      const c = getApiClient();
      if (c.kind === "mock") {
        return { conversations: 0, documents: 0 };
      }
      const data = await c.real.get("/dashboard/stats").then((r) => r.data);
      return {
        conversations: Number(data?.conversations ?? 0),
        documents: Number(data?.documents ?? 0),
      };
    },
    staleTime: 1000 * 60,
  });
}

/** GET /dashboard/recent-activity -> rows of { type, title, timestamp }. */
export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: async (): Promise<RecentActivityItem[]> => {
      const c = getApiClient();
      if (c.kind === "mock") return [];
      const data = await c.real.get("/dashboard/recent-activity").then((r) => r.data);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });
}
