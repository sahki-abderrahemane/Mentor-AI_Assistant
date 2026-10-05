"use client";

import { useAdminLogs } from "@/features/admin/hooks/useAdmin";
import type { AdminLogsResponse } from "@/features/admin/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLogsPage() {
  const { data, isLoading } = useAdminLogs({ pageSize: 100 } as Record<string, unknown>);

  const logs = data as unknown as AdminLogsResponse | undefined;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Logs</h1>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">{logs?.note ?? "Log aggregation not yet configured"}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
