"use client";

import { useUploadDocument } from "@/features/documents/hooks/useDocuments";
import { useCollections } from "@/features/projects/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DocumentUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  return <DocumentUploadAsync searchParams={searchParams} />;
}

function DocumentUploadAsync({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const sp = React.use(searchParams);
  const router = useRouter();
  const upload = useUploadDocument();
  const [files, setFiles] = useState<File[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const { data: collections } = useCollections({ pageSize: 50 });

  const items = collections?.items ?? [];
  const effectiveCollectionId =
    collectionId || (sp.collection && items.some((c: { id: string }) => c.id === sp.collection) ? sp.collection : "") || items[0]?.id || "";

  const onDrop = useCallback((accepted: Array<File>) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  function remove(name: string) { setFiles((prev) => prev.filter((f) => f.name !== name)); }

  async function handleUpload() {
    if (!files.length) return;
    if (!effectiveCollectionId) {
      toast.error("No collection available. Create a collection first.");
      return;
    }
    let succeeded = 0;
    const failedNames: string[] = [];
    for (const file of files) {
      try {
        await upload.mutateAsync({ input: { file, collectionId: effectiveCollectionId, projectId: "" } });
        succeeded += 1;
      } catch {
        failedNames.push(file.name);
      }
    }
    if (failedNames.length === 0) {
      toast.success(`${succeeded} file(s) uploaded`);
    } else {
      toast.error(`${succeeded} uploaded, ${failedNames.length} failed (${failedNames.join(", ")})`);
    }
    setFiles([]);
    router.push("/documents");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload documents</h1>
        <p className="text-sm text-muted-foreground">PDF, Markdown, or text files up to 50MB each.</p>
      </div>

      <div className="space-y-2">
        <Label>Collection</Label>
        <Select value={effectiveCollectionId} onValueChange={setCollectionId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a collection" />
          </SelectTrigger>
          <SelectContent>
            {items.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-12 transition hover:border-primary/50 cursor-pointer"
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        {isDragActive ? <p className="text-sm text-primary">Drop files here…</p> : <p className="text-sm text-muted-foreground">Drag & drop or click to select files</p>}
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <Label>Selected files ({files.length})</Label>
          {files.map((f) => (
            <Card key={f.name}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(f.name)}><X className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" onClick={handleUpload} disabled={upload.isPending}>
            {upload.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <>Upload {files.length} file(s)</>}
          </Button>
        </div>
      )}
    </div>
  );
}