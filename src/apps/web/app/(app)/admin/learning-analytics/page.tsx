"use client";

import { useLearningAnalytics } from "@/features/admin/hooks/useAdminAnalytics";
import type { AdminLearningAnalytics } from "@/features/admin/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, FileText, MessagesSquare, Brain } from "lucide-react";

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLearningAnalyticsPage() {
  const { data, isLoading, isError } = useLearningAnalytics();

  if (isLoading) return <LearningAnalyticsSkeleton />;
  if (isError || !data) return <p className="text-muted-foreground">Failed to load learning analytics.</p>;

  const analytics = data as unknown as AdminLearningAnalytics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Learning Analytics</h1>
        <p className="text-sm text-muted-foreground">Aggregate learning metrics across all users.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Users" value={analytics.totalUsers.toLocaleString()} icon={Users} />
        <StatCard title="Total Sessions" value={analytics.totalSessions.toLocaleString()} icon={Clock} />
        <StatCard title="Total Documents" value={analytics.totalDocuments.toLocaleString()} icon={FileText} />
        <StatCard title="Total Conversations" value={analytics.totalConversations.toLocaleString()} icon={MessagesSquare} />
        <StatCard title="Average Mastery" value={`${Math.round(analytics.averageMastery)}%`} icon={Brain} />
      </div>
    </div>
  );
}

function LearningAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
