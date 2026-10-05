import type { AuditFields } from "./api.types";

export type QuizStatus = "draft" | "published" | "archived";
export type QuestionType = "multiple-choice" | "true-false" | "short-answer";

export interface ListQuizzesParams {
  page?: number;
  pageSize?: number;
  subjectId?: string;
  status?: QuizStatus;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  questionCount: number;
  timeLimitMinutes?: number;
  passingScore: number;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  pointsEarned: number;
}

export interface QuizSubmission {
  quizId: string;
  answers: Array<{ questionId: string; answer: string | string[] }>;
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: Question[];
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}