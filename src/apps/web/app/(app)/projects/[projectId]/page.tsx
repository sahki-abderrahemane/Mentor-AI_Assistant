"use client";

import * as React from "react";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useCollections } from "@/features/projects/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Layers, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  return <ProjectDetail params={params} />;
}

function ProjectDetail({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: collections } = useCollections({ projectId, pageSize: 20 } as Record<string, unknown>);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg" style={{ background: project.color + "22" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: project.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <Badge>{project.role}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: Layers, label: "Collections", value: project.collectionCount },
          { icon: BookOpen, label: "Documents", value: project.documentCount },
          { icon: MessageSquare, label: "Chats", value: project.conversationCount },
          { icon: Clock, label: "Last activity", value: formatDistanceToNow(new Date(project.lastActivityAt ?? project.updatedAt), { addSuffix: true }) },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted"><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="collections">
        <TabsList>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="collections">
          <div className="grid gap-3 sm:grid-cols-2">
            {(collections?.items ?? []).map((col: any) => (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <Card className="transition hover:border-primary/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{col.name}</p>
                      <Badge variant={col.status === "ready" ? "success" : col.status === "indexing" ? "warning" : "destructive"}>{col.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{col.documentCount} docs · {col.citationCount} citations</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}