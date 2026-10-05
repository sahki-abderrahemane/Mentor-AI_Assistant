import { faker, id, isoDate } from "../seed";
import { mockCollections } from "../collections/data";
import { mockUsers } from "../users/data";
import { mockQuizAttempts } from "../quizzes/data";

export interface MockLearningProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyGoalMinutesPerDay: number;
  studyMinutesToday: number;
  topics: MockTopicMastery[];
  recentSessions: MockStudySession[];
  weeklyGoalMinutes: number;
  achievements: MockAchievement[];
  totalStudyHours: number;
  quizzesCompleted: number;
  cardsReviewed: number;
}

export interface MockTopicMastery {
  topicId: string;
  topicName: string;
  masteryPercentage: number;
  quizzesTaken: number;
  averageScore: number;
  cardsReviewed: number;
  lastStudiedAt?: string;
}

export interface MockStudySession {
  id: string;
  userId: string;
  type: "quiz" | "flashcard" | "study_guide" | "chat";
  topicId?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
}

export interface MockAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  criteria: string;
}

const allAchievements: MockAchievement[] = [
  {
    id: "ach_first_quiz",
    title: "First Steps",
    description: "Completed your first quiz",
    icon: "Trophy",
    criteria: "Complete 1 quiz",
  },
  {
    id: "ach_streak_3",
    title: "On a Roll",
    description: "Studied 3 days in a row",
    icon: "Flame",
    criteria: "3-day streak",
  },
  {
    id: "ach_streak_7",
    title: "Week Warrior",
    description: "Studied 7 days in a row",
    icon: "Flame",
    criteria: "7-day streak",
  },
  {
    id: "ach_cards_50",
    title: "Card Collector",
    description: "Reviewed 50 flashcards",
    icon: "Layers",
    criteria: "50 cards reviewed",
  },
  {
    id: "ach_cards_200",
    title: "Memory Master",
    description: "Reviewed 200 flashcards",
    icon: "Brain",
    criteria: "200 cards reviewed",
  },
  {
    id: "ach_quiz_perfect",
    title: "Perfect Score",
    description: "Got 100% on a quiz",
    icon: "Star",
    criteria: "100% on any quiz",
  },
  {
    id: "ach_all_topics",
    title: "Well Rounded",
    description: "Studied all available topics",
    icon: "BookOpen",
    criteria: "1 session per topic",
  },
  {
    id: "ach_5_hours",
    title: "Dedicated Learner",
    description: "Studied for 5+ hours total",
    icon: "Clock",
    criteria: "5 study hours",
  },
];

export const mockLearningData: Map<string, MockLearningProgress> = new Map();

mockUsers.forEach((user) => {
  const userAttempts = mockQuizAttempts.filter((a) => a.userId === user.id);
  const quizzesCompleted = userAttempts.length;
  const cardsReviewed = 20 + Math.floor(Math.random() * 80);

  const topics: MockTopicMastery[] = mockCollections.map((col, i) => {
    const colAttempts = userAttempts.filter((a) =>
      a.quizId.includes(`_${(i % 6) + 1}_`)
    );
    const avgScore = colAttempts.length > 0
      ? Math.round(colAttempts.reduce((sum, a) => sum + a.percentage, 0) / colAttempts.length)
      : 0;
    return {
      topicId: col.id,
      topicName: col.name,
      masteryPercentage: Math.min(95, 20 + Math.floor(Math.random() * 60)),
      quizzesTaken: colAttempts.length,
      averageScore: avgScore,
      cardsReviewed: Math.floor(cardsReviewed / mockCollections.length),
      lastStudiedAt: faker.datatype.boolean() ? isoDate(Math.floor(Math.random() * 5)) : undefined,
    };
  });

  const recentSessions: MockStudySession[] = Array.from({ length: 10 }, (_, i) => {
    const types: MockStudySession["type"][] = ["quiz", "flashcard", "study_guide", "chat"];
    const type = types[i % types.length];
    const topicIdx = i % mockCollections.length;
    const duration = 10 + Math.floor(Math.random() * 35);
    const start = isoDate(i + 1, i * 7200);
    const end = new Date(new Date(start).getTime() + duration * 60_000).toISOString();

    return {
      id: id("sess"),
      userId: user.id,
      type,
      topicId: mockCollections[topicIdx]?.id,
      durationMinutes: duration,
      startedAt: start,
      endedAt: end,
    };
  });

  const unlockedAchievements = allAchievements.filter(() => Math.random() > 0.3);

  mockLearningData.set(user.id, {
    userId: user.id,
    currentStreak: 3 + Math.floor(Math.random() * 5),
    longestStreak: 7 + Math.floor(Math.random() * 10),
    lastStudyDate: isoDate(0),
    studyGoalMinutesPerDay: 30,
    studyMinutesToday: 15 + Math.floor(Math.random() * 25),
    topics,
    recentSessions,
    weeklyGoalMinutes: 120,
    achievements: unlockedAchievements,
    totalStudyHours: 3 + Math.floor(Math.random() * 8),
    quizzesCompleted,
    cardsReviewed,
  });
});

export function getMockLearningProgress(userId: string): MockLearningProgress | undefined {
  return mockLearningData.get(userId);
}

export function getMockStreak(userId: string) {
  const data = mockLearningData.get(userId);
  if (!data) return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", studyGoalMinutesPerDay: 30, studyMinutesToday: 0 };
  return {
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    lastStudyDate: data.lastStudyDate,
    studyGoalMinutesPerDay: data.studyGoalMinutesPerDay,
    studyMinutesToday: data.studyMinutesToday,
  };
}

export function getMockTopicMastery(userId: string): MockTopicMastery[] {
  return mockLearningData.get(userId)?.topics ?? [];
}

export function getMockAchievements(userId: string): MockAchievement[] {
  return mockLearningData.get(userId)?.achievements ?? [];
}