"use client";

import * as React from "react";
import { useDocument } from "@/features/documents/hooks/useDocuments";
import { documentsService } from "@/services/documents.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Quote, Clock, Download, Sparkles } from "lucide-react";
import { formatDistanceToNow, formatBytes } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { useState } from "react";
import { GenerateDialog, type GenerateKind } from "@/features/generation/components/generate-dialog";

export default function DocumentDetailPage({ params }: { params: Promise<{ documentId: string }> }) {
  return <DocumentDetailAsync params={params} />;
}

function DocumentDetailAsync({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = React.use(params);
  const { data: doc, isLoading } = useDocument(documentId);
  const [downloading, setDownloading] = useState(false);
  const [generateKind, setGenerateKind] = useState<GenerateKind | null>(null);

  const handleDownload = async () => {
    if (!doc || downloading) return;
    try {
      setDownloading(true);
      const blob = await documentsService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName ?? doc.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-96" /><Skeleton className="h-64 w-full" /></div>;
  if (!doc) return <p>Document not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-semibold">{doc.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{doc.mimeType}</span><span>·</span><span>{doc.fileType}</span><span>·</span>
              <span>{formatBytes(doc.size)}</span><span>·</span>
              <Clock className="h-3.5 w-3.5" /><span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={doc.status === "ready" ? "success" : ["processing", "uploading", "queued"].includes(doc.status) ? "warning" : "destructive"}>{doc.status}</Badge>
          <Button size="sm" variant="outline" onClick={() => setGenerateKind("quiz")}><Sparkles className="h-4 w-4" /> Quiz</Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateKind("flashcards")}><Sparkles className="h-4 w-4" /> Flashcards</Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateKind("study-guide")}><Sparkles className="h-4 w-4" /> Study guide</Button>
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}><Download className="h-4 w-4" /> {downloading ? "Downloading…" : "Download"}</Button>
        </div>
      </div>

      {doc.status === "failed" && (doc.errorMessage ?? doc.error) && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 text-sm text-destructive">
            Processing failed: {doc.errorMessage ?? doc.error}
          </CardContent>
        </Card>
      )}

      {doc.abstract && (
        <Card><CardContent className="p-4"><p className="text-sm font-medium">Summary</p><p className="mt-1 text-sm text-muted-foreground">{doc.abstract}</p></CardContent></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-4"><Quote className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc.stats?.citations ?? 0} citations</span></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><BookOpen className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc.stats?.chunks ?? 0} chunks</span></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc.indexedAt ? `Indexed ${formatDistanceToNow(new Date(doc.indexedAt), { addSuffix: true })}` : "Not indexed yet"}</span></CardContent></Card>
      </div>

      {(doc.preview?.text || doc.abstract) && (
        <Card><CardContent className="p-6"><MarkdownRenderer content={doc.preview?.text ?? doc.abstract} /></CardContent></Card>
      )}

      {generateKind && (
        <GenerateDialog
          kind={generateKind}
          documents={[{ id: doc.id, title: doc.title }]}
          open
          onOpenChange={(open) => {
            if (!open) setGenerateKind(null);
          }}
          documentId={doc.id}
        />
      )}
    </div>
  );
}