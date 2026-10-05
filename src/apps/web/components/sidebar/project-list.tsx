"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MockProject } from "@/mock/projects/data";

export function ProjectList() {
  const pathname = usePathname();
  const { data, isLoading } = useProjects({ pageSize: 8, starred: false } as { pageSize: number; starred: boolean });

  if (isLoading) {
    return (
      <div className="space-y-2 px-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2">
      {(data?.items ?? []).slice(0, 6).map((project: MockProject) => {
        const active = pathname.startsWith(`/projects/${project.id}`);
        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ background: project.color }}
              aria-hidden
            />
            <FolderKanban className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate">{project.name}</span>
          </Link>
        );
      })}
      <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs">
        <Link href="/projects?new=1">
          <Plus className="h-3.5 w-3.5" /> New project
        </Link>
      </Button>
    </div>
  );
}