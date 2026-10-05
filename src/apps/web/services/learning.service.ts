import {
  mockLearningData,
  getMockLearningProgress,
  getMockStreak,
  getMockTopicMastery,
  getMockAchievements,
} from "@/mock/learning/data";
import { getApiClient } from "@/lib/api";

export interface StartSessionInput {
  type?: string;
  subjectId?: string;
  topicId?: string;
}

export interface EndSessionInput {
  durationMinutes: number;
}

export const learningService = {
  getProgress() {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      return Promise.resolve(u ? getMockLearningProgress(u) ?? null : null);
    }
    return c.real.get("/learning/progress").then((r) => r.data);
  },

  getStreak() {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      return Promise.resolve(u ? getMockStreak(u) : null);
    }
    return c.real.get("/learning/streak").then((r) => r.data);
  },

  getTopicMastery() {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      return Promise.resolve(u ? getMockTopicMastery(u) : []);
    }
    return c.real.get("/learning/mastery").then((r) => r.data);
  },

  getAchievements() {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      return Promise.resolve(u ? getMockAchievements(u) : []);
    }
    return c.real.get("/learning/achievements").then((r) => r.data);
  },

  startSession(input: StartSessionInput) {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      const id = `sess_${Date.now()}`;
      const now = new Date().toISOString();
      const session = {
        id,
        userId: u ?? "u_mock",
        type: (input.type ?? "chat") as "quiz" | "flashcard" | "study_guide" | "chat",
        subjectId: input.subjectId,
        topicId: input.topicId,
        durationMinutes: 0,
        startedAt: now,
        endedAt: now,
      };
      if (u) {
        const data = mockLearningData.get(u);
        if (data) data.recentSessions.unshift(session);
      }
      return Promise.resolve(session);
    }
    return c.real.post("/learning/sessions", input).then((r) => r.data);
  },

  endSession(sessionId: string, input: EndSessionInput) {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      const session = {
        id: sessionId,
        userId: u ?? "u_mock",
        type: "chat" as const,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationMinutes: input.durationMinutes,
      };
      if (u) {
        const data = mockLearningData.get(u);
        if (data) {
          data.recentSessions.unshift(session);
          data.totalStudyHours += input.durationMinutes / 60;
        }
      }
      return Promise.resolve(session);
    }
    return c.real.post(`/learning/sessions/${sessionId}/end`, input).then((r) => r.data);
  },
};

function getAuthId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("mentorai.auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } };
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

void mockLearningData;
