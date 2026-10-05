"use client";

import * as React from "react";
import { useModels } from "@/features/models/hooks/useModels";
import { useCreateTrainingJob, useStartTrainingJob } from "@/features/training/hooks/useTraining";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

const METHODS = ["sft", "qlora", "auto"] as const;
const ADAPTERS = ["chatml", "alpaca", "openai", "sharegpt"] as const;

export function NewTrainingJobDialog() {
  const [open, setOpen] = React.useState(false);
  const { data: modelsData } = useModels({ pageSize: 100 });
  const createJob = useCreateTrainingJob();
  const startJob = useStartTrainingJob();

  const models =
    ((modelsData as { items?: Array<{ id: string; name: string; installed?: boolean; status?: string }> })
      ?.items ?? []);

  const [baseModelId, setBaseModelId] = React.useState("");
  const [datasetSource, setDatasetSource] = React.useState("");
  const [datasetAdapter, setDatasetAdapter] = React.useState<string>("chatml");
  const [method, setMethod] = React.useState<string>("sft");
  const [epochs, setEpochs] = React.useState("3");
  const [learningRate, setLearningRate] = React.useState("0.0002");
  const [batchSize, setBatchSize] = React.useState("8");
  const [loraRank, setLoraRank] = React.useState("16");
  const [loraAlpha, setLoraAlpha] = React.useState("32");

  const busy = createJob.isPending || startJob.isPending;

  const effectiveModelId =
    baseModelId || models.find((m) => m.installed)?.id || models[0]?.id || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveModelId || !datasetSource.trim()) return;
    const job = (await createJob.mutateAsync({
      baseModelId: effectiveModelId,
      datasetSource: datasetSource.trim(),
      hyperparameters: {
        dataset_adapter: datasetAdapter,
        method,
        epochs: Number(epochs),
        learning_rate: Number(learningRate),
        batch_size: Number(batchSize),
        lora_rank: Number(loraRank),
        lora_alpha: Number(loraAlpha),
      },
    })) as { id: string };
    await startJob.mutateAsync(job.id);
    setOpen(false);
    setDatasetSource("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> New training job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New training job</DialogTitle>
            <DialogDescription>
              Fine-tune an installed base model on a dataset. Provide a JSONL link or a
              Hugging&nbsp;Face dataset id.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Base model</Label>
              <Select value={effectiveModelId} onValueChange={setBaseModelId}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a base model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                      {m.installed ? "" : " (not installed)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataset">Dataset link</Label>
              <Input
                id="dataset"
                placeholder="https://…/train.jsonl or org/dataset"
                value={datasetSource}
                onChange={(e) => setDatasetSource(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Adapter format</Label>
                <Select value={datasetAdapter} onValueChange={setDatasetAdapter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ADAPTERS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">QLoRA requires a CUDA GPU.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="epochs">Epochs</Label>
                <Input id="epochs" type="number" min={1} value={epochs} onChange={(e) => setEpochs(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lr">Learning rate</Label>
                <Input id="lr" type="number" step="0.00001" min={0} value={learningRate} onChange={(e) => setLearningRate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bs">Batch size</Label>
                <Input id="bs" type="number" min={1} value={batchSize} onChange={(e) => setBatchSize(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rank">LoRA rank</Label>
                <Input id="rank" type="number" min={1} value={loraRank} onChange={(e) => setLoraRank(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alpha">LoRA alpha</Label>
                <Input id="alpha" type="number" min={1} value={loraAlpha} onChange={(e) => setLoraAlpha(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !effectiveModelId || !datasetSource.trim()}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Start training
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
