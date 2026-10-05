"use client";

import * as React from "react";
import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { useCollection } from "@/features/projects/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Layers, Quote, Clock, Plus } from "lucide-react";
import { formatDistanceToNow, formatBytes } from "@/lib/utils";
import Link from "next/link";

export default function CollectionDetailPage({ params }: { params: Promise<{ collectionId: string }> }) {
  return <CollectionDetailAsync params={params} />;
}

function CollectionDetailAsync({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = React.use(params);
  const { data: col, isLoading } = useCollection(collectionId);
  const { data: docs } = useDocuments({ collectionId, pageSize: 20 } as Record<string, unknown>);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (!col) return <p>Collection not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-semibold">{col.name}</h1>
            <p className="text-sm text-muted-foreground">{col.description}</p>
          </div>
        </div>
        <Badge variant={col.status === "ready" ? "success" : col.status === "indexing" ? "warning" : "destructive"}>{col.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: BookOpen, label: "Documents", value: col.documentCount },
          { icon: Quote, label: "Citations", value: col.citationCount },
          { icon: Layers, label: "Size", value: formatBytes(col.totalSize) },
          { icon: Clock, label: "Updated", value: formatDistanceToNow(new Date(col.updatedAt), { addSuffix: true }) },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><Icon className="h-4 w-4" /></div>
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Documents</h2>
          <Link href={`/documents/upload?collection=${collectionId}`}>
            <Button size="sm"><Plus className="h-4 w-4" /> Add documents</Button>
          </Link>
        </div>
        <div className="grid gap-3">
          {(docs?.items ?? []).map((doc: any) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><BookOpen className="h-4 w-4" /></div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.source} · {formatBytes(doc.size)}</p>
                    </div>
                  </div>
                  <Badge variant={doc.status === "ready" ? "success" : doc.status === "indexing" ? "warning" : "destructive"} className="text-xs">{doc.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}