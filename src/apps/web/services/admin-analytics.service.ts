import { delay } from "@/mock/seed";
import { mockLearningAnalytics } from "@/mock/admin/learning-analytics.data";
import { getApiClient } from "@/lib/api";
import type { MockLearningAnalytics } from "@/mock/admin/learning-analytics.data";

async function fetchMockAnalytics(): Promise<MockLearningAnalytics> {
  await delay(100, 300);
  return { ...mockLearningAnalytics };
}

export const adminAnalyticsService = {
  learningAnalytics: (): Promise<MockLearningAnalytics> => {
    const c = getApiClient();
    if (c.kind === "mock") return fetchMockAnalytics();
    return c.real.get("/admin/learning-analytics").then((r) => r.data);
  },
};