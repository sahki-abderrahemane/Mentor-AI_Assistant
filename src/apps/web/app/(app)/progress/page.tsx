"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react";
import { useProgress, useAchievements, useStreak, useTopicMastery } from "@/features/learning/hooks/useLearning";
import {
  normalizeAchievements,
  normalizeProgress,
  normalizeStreak,
  normalizeTopics,
} from "@/features/learning/progress-view";
import { StreakCalendar } from "@/components/learning/streak-calendar";
import { ProgressChart } from "@/components/learning/progress-chart";
import { AchievementBadge } from "@/components/learning/achievement-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProgressPage() {
  const { data: progressRaw, isLoading } = useProgress();
  const { data: streakRaw } = useStreak();
  const { data: masteryRaw } = useTopicMastery();
  const { data: achievementsRaw } = useAchievements();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const progress = normalizeProgress(progressRaw);
  // Sensible zeros when no streak exists yet — never fabricated values.
  const s = normalizeStreak(streakRaw);
  const topics = normalizeTopics(masteryRaw);
  const achievements = normalizeAchievements(achievementsRaw);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <p className="text-sm text-muted-foreground">Track your study journey</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Study hours"
          value={progress.totalHours.toFixed(1)}
          sub="total"
        />
        <StatCard
          label="Study sessions"
          value={String(progress.totalSessions)}
          sub="completed"
        />
        <StatCard
          label="Average mastery"
          value={`${progress.averageMastery}%`}
          sub={`across ${progress.masteryCount} topics`}
        />
        <StatCard
          label="Achievements"
          value={String(progress.achievementsUnlocked)}
          sub={`of ${achievements.length}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Streak */}
        <StreakCalendar
          currentStreak={s.currentStreak}
          longestStreak={s.longestStreak}
          lastStudyDate={s.lastStudyDate}
          studyMinutesToday={s.studyMinutesToday}
          studyGoalMinutesPerDay={s.studyGoalMinutesPerDay}
        />

        {/* Overview */}
        <Card className="p-5">
          <h3 className="mb-4 font-semibold">Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total study time</span>
              <span className="font-medium">{progress.totalHours.toFixed(1)} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Study sessions</span>
              <span className="font-medium">{progress.totalSessions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Topics studied</span>
              <span className="font-medium">{progress.masteryCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Achievements unlocked</span>
              <span className="font-medium">{progress.achievementsUnlocked}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Topic mastery */}
      <ProgressChart topics={topics} />

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Achievements</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((ach) => (
              <AchievementBadge key={ach.id} achievement={ach} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </Card>
  );
}
