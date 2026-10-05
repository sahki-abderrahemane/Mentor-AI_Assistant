"use client";

import { useSearch } from "@/features/search/hooks/useSearch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { SearchResult } from "@/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useSearch({ query: q, limit: 20 });

  const results = (data ?? []) as SearchResult[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="text-sm text-muted-foreground">Search across documents, chats, projects and more.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search everything…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : results.length ? (
        <div className="space-y-3">
          {results.map((result) => (
            <Link key={result.id} href={`/documents/${result.documentId}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{result.documentTitle}</p>
                      <Badge variant="secondary" className="text-xs">document</Badge>
                      {typeof result.score === "number" && <span className="text-xs text-muted-foreground">{Math.round(result.score * 100)}% match</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{result.snippet}</p>
                    {result.section && <p className="mt-1 text-xs text-muted-foreground">{result.section}{result.page ? ` · page ${result.page}` : ""}</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : q ? (
        <p className="text-center py-12 text-muted-foreground">No results for &ldquo;{q}&rdquo;</p>
      ) : (
        <p className="text-center py-12 text-muted-foreground">Start typing to search…</p>
      )}
    </div>
  );
}