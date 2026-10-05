"use client";

import { useAdminQueues } from "@/features/admin/hooks/useAdmin";
import type { AdminQueue } from "@/features/admin/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminQueuesPage() {
  const { data, isLoading } = useAdminQueues();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;

  const queues = (data ?? []) as unknown as AdminQueue[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Queue status</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {queues.map((q) => (
          <Card key={q.name}>
            <CardContent className="p-4">
              <p className="font-medium">{q.name}</p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Active</span><span>{q.active}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Waiting</span><span>{q.waiting}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Completed</span><span>{q.completed}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Failed</span><span>{q.failed}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
