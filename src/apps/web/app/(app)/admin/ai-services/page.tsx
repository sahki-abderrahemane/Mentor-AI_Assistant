"use client";

import { useAIServices } from "@/features/admin/hooks/useAdmin";
import type { AdminAIService } from "@/features/admin/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function AdminAIServicesPage() {
  const { data, isLoading, refetch, isRefetching } = useAIServices();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;

  const services = (data ?? []) as unknown as AdminAIService[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Services</h1>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((svc) => (
          <Card key={svc.name}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{svc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 break-all">{svc.url}</p>
                </div>
                <Badge variant={svc.healthy ? "success" : "destructive"}>
                  {svc.healthy ? <CheckCircle className="h-3.5 w-3.5 mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
                  {svc.healthy ? "healthy" : "unhealthy"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
