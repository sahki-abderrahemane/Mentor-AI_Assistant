"use client";

import { TrendingUp, Users, Target, Brain, BookOpen, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { MockLearningAnalytics } from "@/mock/admin/learning-analytics.data";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-1">
              {trend && (
                trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-500" /> :
                trend === "down" ? <ArrowDownRight className="h-3 w-3 text-red-500" /> :
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">{sub}</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DAUChart({ data }: { data: MockLearningAnalytics["dailyActiveUsers"] }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Daily Active Users (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-0.5" style={{ height: 120 }}>
          {data.map((d) => (
            <div
              key={d.date}
              className="flex-1 rounded-sm bg-primary/70 hover:bg-primary transition-colors"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
              title={`${d.date}: ${d.count} users`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{data[0]?.date?.slice(5)}</span>
          <span>{data[data.length - 1]?.date?.slice(5)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuizAggregateTable({ quizzes }: { quizzes: MockLearningAnalytics["quizAggregates"] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quiz Pass Rates by Subject</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.subjectId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-medium">{q.subjectName}</span>
                <span className="text-muted-foreground">{q.passRate}%</span>
              </div>
              <Progress value={q.passRate} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StrugglingTopics({ topics }: { topics: MockLearningAnalytics["strugglingTopics"] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Struggling Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((t) => (
            <div key={t.topicId} className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{t.topicName}</p>
                <Progress value={t.mastery} className="h-1.5" />
              </div>
              <div className="ml-4 text-right">
                <Badge variant={t.mastery < 50 ? "destructive" : t.mastery < 65 ? "warning" : "success"} className="text-xs">
                  {t.mastery}%
                </Badge>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{t.attemptCount} attempts</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LearningAnalyticsDashboardProps {
  data: MockLearningAnalytics;
}

export function LearningAnalyticsDashboard({ data }: LearningAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Mastery"
          value={`${data.avgMastery}%`}
          sub="across all topics"
          icon={Brain}
          trend="up"
        />
        <StatCard
          title="Quiz Pass Rate"
          value={`${Math.round(data.quizAggregates.reduce((s, q) => s + q.passRate, 0) / data.quizAggregates.length)}%`}
          sub="average across subjects"
          icon={Target}
          trend="up"
        />
        <StatCard
          title="7-Day Retention"
          value={`${data.retentionRate7d}%`}
          sub="users return within 7d"
          icon={Users}
          trend="stable"
        />
        <StatCard
          title="Quizzes Taken"
          value={data.totalQuizzesTaken.toLocaleString()}
          sub="all time"
          icon={BookOpen}
          trend="up"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DAUChart data={data.dailyActiveUsers} />
        <QuizAggregateTable quizzes={data.quizAggregates} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StrugglingTopics topics={data.strugglingTopics} />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Learning Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weekly active users</span>
              <span className="font-medium">{data.weeklyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly active users</span>
              <span className="font-medium">{data.monthlyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total flashcards reviewed</span>
              <span className="font-medium">{data.totalFlashcardsReviewed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg quiz score</span>
              <span className="font-medium">
                {Math.round(data.quizAggregates.reduce((s, q) => s + q.avgScore, 0) / data.quizAggregates.length)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total subjects</span>
              <span className="font-medium">{data.quizAggregates.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function LearningAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}