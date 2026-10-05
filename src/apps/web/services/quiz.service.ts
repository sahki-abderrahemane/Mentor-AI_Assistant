import {
  mockQuizzes,
  getMockQuiz,
  getMockQuizQuestions,
  getMockQuizAttempts,
  type MockQuiz,
  type MockQuestion,
  type MockQuizAttempt,
} from "@/mock/quizzes/data";
import { getApiClient } from "@/lib/api";
import { paginate } from "@/mock/seed";
import type { QuizStatus } from "@/types/quizzes.types";

export interface ListQuizzesParams {
  page?: number;
  pageSize?: number;
  subjectId?: string;
  status?: QuizStatus;
}

export const quizService = {
  list(params: ListQuizzesParams = {}) {
    const c = getApiClient();
    if (c.kind === "mock") {
      let items = [...mockQuizzes];
      if (params.subjectId) {
        items = items.filter((q) => q.subjectId === params.subjectId);
      }
      if (params.status) {
        items = items.filter((q) => q.status === params.status);
      }
      return Promise.resolve(paginate(items, params.page ?? 1, params.pageSize ?? 20));
    }
    return c.real.get("/quizzes", { params }).then((r) => r.data);
  },

  get(id: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getMockQuiz(id) ?? null);
    }
    return c.real.get(`/quizzes/${id}`).then((r) => r.data);
  },

  getQuestions(quizId: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      return Promise.resolve(getMockQuizQuestions(quizId));
    }
    return c.real.get(`/quizzes/${quizId}/questions`).then((r) => r.data);
  },

  listAttempts(quizId: string) {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId();
      return Promise.resolve(getMockQuizAttempts(u ?? "u_mock", quizId));
    }
    return c.real.get(`/quizzes/${quizId}/attempts`).then((r) => r.data);
  },

  submit(
    quizId: string,
    answers: Array<{ questionId: string; answer: string | string[] }>
  ) {
    const c = getApiClient();
    if (c.kind === "mock") {
      const u = getAuthId() ?? "u_mock";
      const questions = getMockQuizQuestions(quizId);
      let score = 0;
      const totalPoints = questions.length;
      const results = questions.map((q) => {
        const userAnswer = answers.find((a) => a.questionId === q.id);
        let correct = false;
        let pointsEarned = 0;

        if (userAnswer) {
          if (q.options) {
            const correctOpt = q.options.find((o) => o.isCorrect);
            correct = userAnswer.answer === correctOpt?.text;
          } else {
            correct =
              (userAnswer.answer as string).toLowerCase().trim() ===
              (q.correctAnswer ?? "").toLowerCase().trim();
          }
          if (correct) {
            pointsEarned = q.points;
            score += q.points;
          }
        }

        return {
          questionId: q.id,
          answer: userAnswer?.answer ?? "",
          correct,
          pointsEarned,
        };
      });

      const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const attempt: MockQuizAttempt = {
        id: `att_${u}_${quizId}_${Date.now()}`,
        quizId,
        userId: u,
        score,
        totalPoints,
        percentage,
        passed: percentage >= 70,
        timeSpentSeconds: 180 + Math.floor(Math.random() * 600),
        startedAt: new Date(Date.now() - 600_000).toISOString(),
        completedAt: new Date().toISOString(),
        answers: results,
      };

      return Promise.resolve(attempt);
    }
    return c.real.post(`/quizzes/${quizId}/attempts`, { answers }).then((r) => r.data);
  },
};

void mockQuizzes;
void getMockQuiz;
void getMockQuizAttempts;

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