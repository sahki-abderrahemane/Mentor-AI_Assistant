"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { useStudyGuides } from "@/features/studyguides/hooks/useStudyGuides";
import { toStudyGuideView, type StudyGuideView as GuideView } from "@/features/studyguides/guide-view";
import { StudyGuideCard } from "@/components/studyguide/studyguide-card";
import type { StudyGuide } from "@/types/studyguides.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GenerateDialog } from "@/features/generation/components/generate-dialog";
import { useDocuments } from "@/features/documents/hooks/useDocuments";

export default function StudyGuidesPage() {
  const { data, isLoading } = useStudyGuides({ pageSize: 50 });
  const { data: documentsData } = useDocuments({ pageSize: 100 });
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Study Guides</h1>
            <p className="text-sm text-muted-foreground">AI-generated summaries and concept guides</p>
          </div>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate with AI
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">No study guides yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Study guides are auto-generated when you add sources to subjects.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((guide: unknown) => {
            const view: GuideView = toStudyGuideView(guide);
            return <StudyGuideCard key={view.id || undefined} guide={view as unknown as StudyGuide} />;
          })}
        </div>
      )}

      <GenerateDialog
        kind="study-guide"
        documents={(documentsData?.items ?? []).map((d: { id: string; title: string }) => ({ id: d.id, title: d.title }))}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </div>
  );
}