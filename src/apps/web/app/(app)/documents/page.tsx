"use client";

import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Clock, Search } from "lucide-react";
import { formatDistanceToNow, formatBytes } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function DocumentsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useDocuments({ pageSize: 50 } as Record<string, unknown>);

  const items = data?.items ?? [];
  const filtered = q ? items.filter((d: any) => d.title.toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Learning Materials</h1>
          <p className="text-sm text-muted-foreground">All indexed documents across your workspace.</p>
        </div>
        <Button asChild><Link href="/documents/upload"><BookOpen className="h-4 w-4" /> Upload</Link></Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc: any) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><FileText className="h-4 w-4" /></div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.mimeType}</span>
                        <span>·</span>
                        <span>{formatBytes(doc.size)}</span>
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{doc.fileType}</Badge>
                    <Badge variant={doc.status === "ready" ? "success" : ["processing", "uploading", "queued"].includes(doc.status) ? "warning" : "destructive"} className="text-xs">{doc.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-center py-12 text-muted-foreground">No documents found.</p>}
        </div>
      )}
    </div>
  );
}