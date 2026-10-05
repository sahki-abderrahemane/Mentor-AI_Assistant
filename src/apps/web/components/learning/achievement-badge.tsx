"use client";

import { Trophy, Flame, Layers, Brain, Clock, BookOpen, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NormalizedAchievement } from "@/features/learning/progress-view";

interface AchievementBadgeProps {
  achievement: NormalizedAchievement;
}

const iconMap: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const unlocked = Boolean(achievement.unlockedAt);

  return (
    <Card
      className={cn(
        "flex items-center gap-3 p-3 transition-all",
        !unlocked && "opacity-50 grayscale"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          unlocked ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" : "bg-muted text-muted-foreground"
        )}
      >
        {iconMap[achievement.icon] ?? <Trophy className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{achievement.title}</p>
        <p className="truncate text-xs text-muted-foreground">{achievement.description}</p>
      </div>
    </Card>
  );
}