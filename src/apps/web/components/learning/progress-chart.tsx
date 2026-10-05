"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MockTopicMastery } from "@/mock/learning/data";

interface ProgressChartProps {
  topics: MockTopicMastery[];
}

export function ProgressChart({ topics }: ProgressChartProps) {
  if (topics.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="mb-4 font-semibold">Topic Mastery</h3>
        <p className="text-sm text-muted-foreground">No topics studied yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="mb-4 font-semibold">Topic Mastery</h3>
      <div className="space-y-4">
        {topics.slice(0, 8).map((topic) => (
          <div key={topic.topicId} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium truncate max-w-[180px]">{topic.topicName}</span>
              <span className="text-muted-foreground">{topic.masteryPercentage}%</span>
            </div>
            <Progress value={topic.masteryPercentage} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
}