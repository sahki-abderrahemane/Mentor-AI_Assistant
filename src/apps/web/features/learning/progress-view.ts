/**
 * Normalizers that unify mock-mode learning data (services/learning.service.ts mock
 * branch) and the real API payloads (backend learning module) into a single view
 * shape so pages render correctly in both modes.
 *
 * Real API contracts:
 * - GET /learning/streak      -> { currentStreak, longestStreak, lastActiveDate, totalActiveDays, studyGoalMinutesPerDay, studyMinutesToday }
 * - GET /learning/progress    -> { totalSessions, totalDurationMinutes, masteryCount, averageMastery, achievementsUnlocked }
 * - GET /learning/mastery     -> TopicMastery[] { topicName, masteryPercentage, quizzesTaken, averageScore, cardsReviewed, lastStudiedAt }
 * - GET /learning/achievements-> UserAchievement[] { ..., unlockedAt, achievement: { title, description, icon } }
 */

export interface NormalizedStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyGoalMinutesPerDay: number;
  studyMinutesToday: number;
}

export interface NormalizedProgress {
  totalSessions: number;
  totalHours: number;
  masteryCount: number;
  averageMastery: number;
  achievementsUnlocked: number;
}

export interface NormalizedTopicMastery {
  topicId: string;
  topicName: string;
  masteryPercentage: number;
  quizzesTaken: number;
  averageScore: number;
  cardsReviewed: number;
  lastStudiedAt?: string;
}

export interface NormalizedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

type Raw = Record<string, unknown> | null | undefined;

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function normalizeStreak(raw: Raw): NormalizedStreak {
  if (!raw) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: "",
      studyGoalMinutesPerDay: 30,
      studyMinutesToday: 0,
    };
  }
  // Real API uses lastActiveDate; mock uses lastStudyDate.
  const lastDate = str(raw.lastActiveDate) || str(raw.lastStudyDate);
  return {
    currentStreak: num(raw.currentStreak),
    longestStreak: num(raw.longestStreak),
    lastStudyDate: lastDate,
    studyGoalMinutesPerDay: num(raw.studyGoalMinutesPerDay, 30),
    studyMinutesToday: num(raw.studyMinutesToday),
  };
}

export function normalizeProgress(raw: Raw): NormalizedProgress {
  if (!raw) {
    return {
      totalSessions: 0,
      totalHours: 0,
      masteryCount: 0,
      averageMastery: 0,
      achievementsUnlocked: 0,
    };
  }

  if (raw.totalDurationMinutes !== undefined) {
    // Real aggregate shape.
    return {
      totalSessions: num(raw.totalSessions),
      totalHours: Math.round((num(raw.totalDurationMinutes) / 60) * 10) / 10,
      masteryCount: num(raw.masteryCount),
      averageMastery: num(raw.averageMastery),
      achievementsUnlocked: num(raw.achievementsUnlocked),
    };
  }

  // Mock shape: derive from recentSessions/topics/achievements.
  const topics = Array.isArray(raw.topics) ? raw.topics : [];
  const sessions = Array.isArray(raw.recentSessions) ? raw.recentSessions : [];
  const achievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  const avgMastery =
    topics.length > 0
      ? Math.round(
          topics.reduce((s: number, t: Raw) => s + num(t?.masteryPercentage), 0) / topics.length
        )
      : 0;

  return {
    totalSessions: sessions.length,
    totalHours: Math.round(num(raw.totalStudyHours) * 10) / 10,
    masteryCount: topics.length,
    averageMastery: avgMastery,
    achievementsUnlocked: achievements.filter((a: Raw) => Boolean(a?.unlockedAt)).length,
  };
}

export function normalizeTopics(raw: unknown): NormalizedTopicMastery[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t: Raw, i) => ({
    topicId: str(t?.topicId) || str(t?.id) || `topic_${i}`,
    topicName: str(t?.topicName),
    masteryPercentage: num(t?.masteryPercentage),
    quizzesTaken: num(t?.quizzesTaken),
    averageScore: num(t?.averageScore),
    cardsReviewed: num(t?.cardsReviewed),
    lastStudiedAt: str(t?.lastStudiedAt) || undefined,
  }));
}

export function normalizeAchievements(raw: unknown): NormalizedAchievement[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a: Raw, i) => {
    // Real shape nests the achievement definition; mock is flat.
    const inner = (a?.achievement ?? null) as Raw;
    const title = str(inner?.title) || str(a?.title);
    return {
      id: str(a?.id) || `${title}_${i}`,
      title,
      description: str(inner?.description) || str(a?.description),
      icon: str(inner?.icon) || str(a?.icon) || "Trophy",
      unlockedAt: str(a?.unlockedAt) || undefined,
    };
  });
}
