"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyMinutesToday: number;
  studyGoalMinutesPerDay: number;
}

export function StreakCalendar({
  currentStreak,
  longestStreak,
  studyMinutesToday,
  studyGoalMinutesPerDay,
}: StreakCalendarProps) {
  const todayGoalPct = Math.min(100, Math.round((studyMinutesToday / studyGoalMinutesPerDay) * 100));
  const weeks = 12;
  const daysPerWeek = 7;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(todayStr).getTime();

  const grid = useMemo(() => {
    const result: Array<{ date: string; minutes: number }> = [];
    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < daysPerWeek; d++) {
        const daysAgo = w * 7 + (6 - d);
        const seed = (w * 7 + d) * 17 + 3;
        const minutes = daysAgo === 0 ? studyMinutesToday : ((seed * 7) % 50);
        result.push({
          date: new Date(todayMs - daysAgo * 86_400_000).toISOString().slice(0, 10),
          minutes,
        });
      }
    }
    return result;
  }, [todayMs, studyMinutesToday]);

  function intensity(minutes: number): string {
    if (minutes === 0) return "bg-muted";
    if (minutes < 10) return "bg-green-200 dark:bg-green-900";
    if (minutes < 25) return "bg-green-300 dark:bg-green-700";
    if (minutes < 40) return "bg-green-400 dark:bg-green-600";
    return "bg-green-500 dark:bg-green-500";
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">Longest: {longestStreak} days</p>
        </div>
      </div>

      <div className="mb-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Today&apos;s goal ({studyMinutesToday}/{studyGoalMinutesPerDay} min)</span>
          <span className="font-medium">{todayGoalPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${todayGoalPct}%` }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {grid.map((day, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-sm",
                day.date === todayStr ? "ring-1 ring-primary" : "",
                intensity(day.minutes)
              )}
              title={`${day.date}: ${day.minutes} min`}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="h-2 w-2 rounded-sm bg-muted" />
        <div className="h-2 w-2 rounded-sm bg-green-200 dark:bg-green-900" />
        <div className="h-2 w-2 rounded-sm bg-green-300 dark:bg-green-700" />
        <div className="h-2 w-2 rounded-sm bg-green-400 dark:bg-green-600" />
        <div className="h-2 w-2 rounded-sm bg-green-500" />
        <span>More</span>
      </div>
    </Card>
  );
}