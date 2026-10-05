"use client";

import * as React from "react";
import { useCollections, useCreateCollection, useProjects } from "@/features/projects/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/forms/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Layers, BookOpen, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().min(1, "Pick a project"),
});

export default function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  return <CollectionsAsync searchParams={searchParams} />;
}

function CollectionsAsync({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = React.use(searchParams);
  const router = useRouter();
  const open = sp.new === "1";
  const { data, isLoading } = useCollections({ pageSize: 50 } as Record<string, unknown>);
  const { data: projectsData } = useProjects({ pageSize: 50 } as Record<string, unknown>);
  const create = useCreateCollection();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", description: "", projectId: "" },
  });

  const projectItems = (projectsData?.items ?? []) as Array<{ id: string; name: string }>;
  const hasProjects = projectItems.length > 0;

  async function onSubmit(values: z.infer<typeof createSchema>) {
    try {
      await create.mutateAsync({
        name: values.name,
        description: values.description,
        projectId: values.projectId,
      });
      toast.success("Collection created");
      reset();
      router.replace("/collections", { scroll: false });
    } catch {
      toast.error("Failed to create collection");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Subjects</h1>
          <p className="text-sm text-muted-foreground">Group documents for focused retrieval and citation.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => router[v ? "push" : "replace"](v ? "/collections?new=1" : "/collections", { scroll: false })}
        >
          <DialogTrigger asChild>
            <Button disabled={!hasProjects}>
              <Plus className="h-4 w-4" /> New collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create collection</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Name" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="e.g. Attention papers" />
              </FormField>
              <FormField label="Project" error={errors.projectId?.message} required>
                <select
                  {...register("projectId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a project…</option>
                  {projectItems.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Description" error={errors.description?.message}>
                <Input {...register("description")} placeholder="Optional description…" />
              </FormField>
              <Button type="submit" className="w-full" disabled={create.isPending}>Create collection</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.items ?? []).map((col: any) => (
            <Link key={col.id} href={`/collections/${col.id}`}>
              <Card className="group h-full transition hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><Layers className="h-4 w-4 text-primary" /></div>
                    {col.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="mb-1 font-semibold group-hover:text-primary">{col.name}</p>
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{col.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={col.status === "ready" ? "success" : col.status === "indexing" ? "warning" : "destructive"} className="text-xs">{col.status}</Badge>
                    <Badge variant="secondary" className="text-xs"><BookOpen className="h-3 w-3" /> {col.documentCount} docs</Badge>
                    <Badge variant="secondary" className="text-xs">{formatBytes(col.totalSize)}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(col.updatedAt), { addSuffix: true })}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}