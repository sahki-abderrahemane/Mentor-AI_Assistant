"use client";

import { useSystemHealth } from "@/features/admin/hooks/useAdmin";
import type { AdminSystemHealth } from "@/features/admin/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function isUp(value: string | undefined) {
  return value === "up" || value === "operational" || value === "healthy";
}

export default function AdminHealthPage() {
  const { data, isLoading } = useSystemHealth();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (!data) return <p>Failed to load health status.</p>;

  const health = data as unknown as AdminSystemHealth;
  const ok = health.status === "ok";
  const Icon = ok ? CheckCircle : health.status === "degraded" ? AlertTriangle : XCircle;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">System health</h1>
        <Badge variant={ok ? "success" : "destructive"}>
          <Icon className="h-3.5 w-3.5 mr-1" />{health.status}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-3 font-semibold">Services</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(health.services ?? {}).map(([name, state]) => {
              const up = isUp(state);
              return (
                <div key={name} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${up ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span>{name}</span>
                  <span className="text-xs text-muted-foreground">{up ? "up" : state}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
    </div>
  );
}
