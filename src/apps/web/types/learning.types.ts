import type { AuditFields } from "./api.types";

export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyGoalMinutesPerDay: number;
  studyMinutesToday: number;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  masteryPercentage: number;
  quizzesTaken: number;
  averageScore: number;
  cardsReviewed: number;
  lastStudiedAt?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  type: "quiz" | "flashcard" | "study_guide" | "chat";
  topicId?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
}

export interface WeeklyGoal {
  targetMinutes: number;
  completedMinutes: number;
  weekStart: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  criteria: string;
}

export interface LearningProgress {
  userId: string;
  streak: LearningStreak;
  topics: TopicMastery[];
  recentSessions: StudySession[];
  weeklyGoal: WeeklyGoal;
  achievements: Achievement[];
  totalStudyHours: number;
  quizzesCompleted: number;
  cardsReviewed: number;
}