"use client";

import { useTrainingJobs } from "@/features/training/hooks/useTraining";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { NewTrainingJobDialog } from "@/features/training/components/new-training-job-dialog";
import { toTrainingJobView } from "@/features/training/job-view";

const STATUS_ICON = { running: Loader2, completed: CheckCircle, failed: XCircle, queued: Clock };

export default function TrainingPage() {
  const { data, isLoading } = useTrainingJobs({ pageSize: 50 } as Record<string, unknown>);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Training</h1>
          <p className="text-sm text-muted-foreground">Fine-tune models and manage training jobs.</p>
        </div>
        <NewTrainingJobDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Active jobs", value: data?.items.filter((j: any) => j.status === "running").length ?? 0, color: "text-blue-500" },
          { label: "Completed", value: data?.items.filter((j: any) => j.status === "completed").length ?? 0, color: "text-green-500" },
          { label: "Failed", value: data?.items.filter((j: any) => j.status === "failed").length ?? 0, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items ?? []).map((raw: Record<string, unknown>) => {
            const job = toTrainingJobView(raw);
            const Icon = STATUS_ICON[job.status as keyof typeof STATUS_ICON] ?? Clock;
            return (
              <Link key={job.id} href={`/training/jobs/${job.id}`}>
                <Card className="transition hover:border-primary/40">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${job.status === "running" ? "bg-blue-500/10" : job.status === "completed" ? "bg-green-500/10" : job.status === "failed" ? "bg-red-500/10" : "bg-muted"}`}>
                        <Icon className={`h-4 w-4 ${job.status === "running" ? "animate-spin text-blue-500" : ""}`} />
                      </div>
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-xs text-muted-foreground">{job.datasetLabel} · {job.method ? job.method.toUpperCase() : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.status === "running" && job.progress !== null && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{job.progress}%</p>
                          {job.totalSteps ? <p className="text-xs text-muted-foreground">Step {job.currentStep ?? 0}/{job.totalSteps}</p> : null}
                        </div>
                      )}
                      {job.status === "completed" && <Badge variant="success">completed</Badge>}
                      {job.status === "failed" && <Badge variant="destructive">failed</Badge>}
                      {job.status === "cancelled" && <Badge variant="secondary">cancelled</Badge>}
                      {job.status === "running" && <Badge variant="default" className="bg-blue-500">running</Badge>}
                      {job.status === "queued" && <Badge variant="secondary">queued</Badge>}
                      {job.status === "preparing" && <Badge variant="default" className="bg-amber-500">preparing</Badge>}
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {data?.items?.length === 0 && <p className="text-center py-12 text-muted-foreground">No training jobs yet.</p>}
        </div>
      )}
    </div>
  );
}