"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, MessageSquare, Brain, Layers, Target, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProgress, useTopicMastery } from "@/features/learning/hooks/useLearning";
import { normalizeProgress, normalizeTopics } from "@/features/learning/progress-view";
import { useDashboardStats, useRecentActivity } from "@/features/dashboard/hooks/useDashboard";
import { useQuizzes } from "@/features/quizzes/hooks/useQuizzes";
import { useDueCards } from "@/features/flashcards/hooks/useFlashcards";
import { formatDistanceToNow } from "@/lib/utils";

export default function DashboardPage() {
  const { data: progressRaw, isLoading: progressLoading } = useProgress();
  const { data: stats } = useDashboardStats();
  const { data: activity } = useRecentActivity();
  const { data: masteryRaw } = useTopicMastery();
  const { data: quizzes } = useQuizzes({ pageSize: 10 });
  const { data: dueCards } = useDueCards();

  const progress = normalizeProgress(progressRaw);
  const mastery = normalizeTopics(masteryRaw);
  const dueCount = dueCards?.length ?? 0;
  const quizItems = quizzes?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Keep up the great work!
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Documents"
          value={stats?.documents ?? 0}
          hint={progressLoading ? "" : `${progress.masteryCount} topics studied`}
          icon={BookOpen}
          accent="from-emerald-500/15 via-emerald-500/5"
          loading={false}
        />
        <StatCard
          label="Conversations"
          value={stats?.conversations ?? 0}
          hint="with your AI tutor"
          icon={MessageSquare}
          accent="from-blue-500/15 via-blue-500/5"
          loading={false}
        />
        <StatCard
          label="Study Sessions"
          value={progress.totalSessions}
          hint={`${progress.totalHours.toFixed(1)} h total`}
          icon={Layers}
          accent="from-orange-500/15 via-orange-500/5"
          loading={progressLoading}
        />
        <StatCard
          label="Avg Mastery"
          value={`${progress.averageMastery}%`}
          hint={`across ${progress.masteryCount} topics`}
          icon={Target}
          accent="from-violet-500/15 via-violet-500/5"
          loading={progressLoading}
        />
      </div>

      {/* Study section + quick access */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Cards due today */}
        {dueCount > 0 ? (
          <Link href={`/flashcards/${dueCards?.[0]?.deckId ?? ""}`}>
            <Card className="p-5 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{dueCount} cards due today</p>
                  <p className="text-xs text-muted-foreground">Tap to start reviewing</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">No flashcards due today</p>
              </div>
            </div>
          </Card>
        )}

        {/* Continue learning */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Continue learning</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { href: "/quizzes", icon: Target, label: "Quizzes", color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300" },
              { href: "/flashcards", icon: Brain, label: "Flashcards", color: "text-violet-600 bg-violet-100 dark:bg-violet-900 dark:text-violet-300" },
              { href: "/study-guides", icon: BookOpen, label: "Study Guides", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300" },
              { href: "/progress", icon: Layers, label: "Progress", color: "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300" },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="group flex items-center gap-2 rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-accent transition-all">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.color.split(" ")[1]} ${a.color.split(" ")[2]}`}>
                  <a.icon className={`h-4 w-4 ${a.color.split(" ")[0]}`} />
                </div>
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Topic mastery */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Topic Mastery</h3>
          <div className="space-y-2">
            {mastery.slice(0, 3).map((t) => (
              <div key={t.topicId} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[120px]">{t.topicName}</span>
                  <span className="text-muted-foreground">{t.masteryPercentage}%</span>
                </div>
                <Progress value={t.masteryPercentage} className="h-1.5" />
              </div>
            ))}
            {mastery.length === 0 && (
              <p className="text-xs text-muted-foreground">Start studying to track your progress.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Available quizzes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Available Quizzes</CardTitle>
            <Link href="/quizzes" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {quizItems.slice(0, 4).map((q: { id: string; title: string; questionCount?: number; passingScore?: number }) => (
              <Link key={q.id} href={`/quizzes/${q.id}`} className="group flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium group-hover:text-primary">{q.title}</p>
                  {q.questionCount != null && (
                    <p className="text-xs text-muted-foreground">{q.questionCount} questions</p>
                  )}
                </div>
                {q.passingScore != null && (
                  <Badge variant="success" className="text-[10px]">{q.passingScore}% to pass</Badge>
                )}
              </Link>
            ))}
            {quizItems.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No quizzes available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent activity (dashboard feed: conversations & messages) */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link href="/chat" className="text-xs text-primary hover:underline">Open chat</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {(activity ?? []).slice(0, 4).map((item) => (
              <div key={item.id ?? `${item.type}-${item.timestamp}`} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  item.type === "message"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
                }`}>
                  {item.type === "message" ? <Target className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">{(item.title ?? "").replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground capitalize">{(item.type ?? "").replace("_", " ")}</p>
                </div>
                {item.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
            ))}
            {(activity ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
