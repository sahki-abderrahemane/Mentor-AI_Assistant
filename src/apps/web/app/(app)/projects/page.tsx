"use client";

import * as React from "react";
import { useProjects, useCreateProject } from "@/features/projects/hooks/useProjects";
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
import { Plus, Star, Layers, BookOpen, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const createSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  return <ProjectsAsync searchParams={searchParams} />;
}

function ProjectsAsync({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const sp = React.use(searchParams);
  const router = useRouter();
  const open = sp.new === "1";
  const { data, isLoading } = useProjects({ pageSize: 50 } as Record<string, unknown>);
  const create = useCreateProject();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: z.infer<typeof createSchema>) {
    try {
      await create.mutateAsync({ name: values.name, description: values.description });
      toast.success("Project created");
      reset();
      router.replace("/projects", { scroll: false });
    } catch {
      toast.error("Failed to create project");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Courses</h1>
          <p className="text-sm text-muted-foreground">Organise collections and track research topics.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => router[v ? "push" : "replace"](v ? "/projects?new=1" : "/projects", { scroll: false })}
        >
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> New project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Name" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="e.g. LoRA finetuning" />
              </FormField>
              <FormField label="Description" error={errors.description?.message}>
                <Input {...register("description")} placeholder="Optional description…" />
              </FormField>
              <Button type="submit" className="w-full" disabled={create.isPending}>Create project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.items ?? []).map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group h-full transition hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: project.color + "22" }}>
                        <span className="h-5 w-5 rounded-sm" style={{ background: project.color }} />
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                    {project.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {project.collectionCount} collections</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {project.documentCount} docs</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {project.conversationCount} chats</span>
                  </div>
                  {project.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.tags.map((tag: any) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}