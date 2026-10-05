"use client";

import * as React from "react";
import { useTrainingJob } from "@/features/training/hooks/useTraining";
import { toTrainingJobView } from "@/features/training/job-view";
import { useModels } from "@/features/models/hooks/useModels";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LossChart } from "@/components/charts/loss-chart";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_ICON = { running: Loader2, completed: CheckCircle, failed: XCircle, queued: Clock };

export default function TrainingJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  return <JobAsync params={params} />;
}

function JobAsync({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = React.use(params);
  const { data: job, isLoading } = useTrainingJob(jobId);
  const { data: modelsData } = useModels({ pageSize: 100 });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!job) return <p>Training job not found.</p>;

  const view = toTrainingJobView(job as Record<string, unknown>);
  const modelName =
    (modelsData as { items?: Array<{ id: string; name: string; repoId?: string }> } | undefined)
      ?.items?.find((m) => m.id === view.baseModelId || m.repoId === view.baseModelLabel)?.name ??
    view.baseModelLabel;

  const Icon = STATUS_ICON[view.status as keyof typeof STATUS_ICON] ?? Clock;
  const epochsLabel =
    view.currentEpoch !== null && view.totalEpochs !== null
      ? `${view.currentEpoch}/${view.totalEpochs}`
      : view.epochs !== null
        ? `${view.epochs}`
        : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${view.status === "running" ? "bg-blue-500/10" : view.status === "completed" ? "bg-green-500/10" : view.status === "failed" ? "bg-red-500/10" : "bg-muted"}`}>
            <Icon className={`h-5 w-5 ${view.status === "running" ? "animate-spin text-blue-500" : ""}`} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{view.name}</h1>
            <p className="text-sm text-muted-foreground">{modelName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={view.status === "completed" ? "success" : view.status === "failed" ? "destructive" : view.status === "running" ? "default" : "secondary"}>{view.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Progress", value: view.progress !== null ? `${view.progress}%` : "—" },
          { label: "Steps", value: view.currentStep !== null && view.totalSteps ? `${view.currentStep}/${view.totalSteps}` : view.totalSteps ? `0/${view.totalSteps}` : "—" },
          { label: "Learning rate", value: view.learningRate ?? "—" },
          { label: "Batch size", value: view.batchSize?.toString() ?? "—" },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Epochs", value: epochsLabel },
          { label: "Method", value: view.method?.toUpperCase() ?? "—" },
          { label: "Dataset format", value: view.datasetAdapter ?? "—" },
        ].map(({ label, value }) => (
          <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></CardContent></Card>
        ))}
      </div>

      {view.metrics.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 font-semibold">Training progress</p>
            <LossChart data={view.metrics} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="font-semibold">Configuration</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { label: "Base model", value: modelName },
              { label: "Dataset", value: view.datasetLabel },
              { label: "Duration", value: view.durationMs ? `${Math.round(view.durationMs / 60_000)}m` : view.status === "running" ? "in progress…" : "—" },
              { label: "Updated", value: formatDistanceToNow(new Date(view.updatedAt), { addSuffix: true }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
