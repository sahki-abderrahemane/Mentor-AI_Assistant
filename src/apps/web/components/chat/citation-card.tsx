"use client";

import { ChatCitation } from "@/services";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CitationCardProps {
  number: number;
  citation: ChatCitation;
  onOpen?: () => void;
}

export function CitationCard({ number, citation, onOpen }: CitationCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent"
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium">{citation.documentTitle}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {citation.collectionName ?? "Source"}
          {citation.page ? ` · p. ${citation.page}` : ""}
          {citation.section ? ` · ${citation.section}` : ""}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{citation.snippet}</p>
      </div>
      <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </button>
  );
}

export function CitationCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <Skeleton className="h-7 w-7 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

void Button;
