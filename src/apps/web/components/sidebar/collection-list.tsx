"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { useCollections } from "@/features/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MockCollection } from "@/mock/collections/data";

export function CollectionList() {
  const pathname = usePathname();
  const { data, isLoading } = useCollections({ pageSize: 12 } as { pageSize: number });

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
      {(data?.items ?? []).slice(0, 8).map((col: MockCollection) => {
        const active = pathname.endsWith(`/collections/${col.id}`);
        return (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate">{col.name}</span>
            <Badge variant="neutral" className="rounded-sm px-1 text-[10px]">
              {col.documentCount}
            </Badge>
          </Link>
        );
      })}
      <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs">
        <Link href="/collections?new=1">
          <Plus className="h-3.5 w-3.5" /> New collection
        </Link>
      </Button>
    </div>
  );
}