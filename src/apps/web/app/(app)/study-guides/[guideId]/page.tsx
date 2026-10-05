"use client";

import * as React from "react";
import { useStudyGuide } from "@/features/studyguides/hooks/useStudyGuides";
import { toStudyGuideView } from "@/features/studyguides/guide-view";
import { StudyGuideView } from "@/components/studyguide/studyguide-view";
import type { StudyGuide } from "@/types/studyguides.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function StudyGuidePage({ params }: { params: Promise<{ guideId: string }> }) {
  return <StudyGuideAsync params={params} />;
}

function StudyGuideAsync({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = React.use(params);
  const { data: guide, isLoading } = useStudyGuide(guideId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Study guide not found</p>
          <Button asChild className="mt-4">
            <Link href="/study-guides">Back to study guides</Link>
          </Button>
        </div>
      </div>
    );
  }

  const view = toStudyGuideView(guide);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/study-guides">← Back to study guides</Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{view.title}</h1>
            {view.subjectName && <p className="text-sm text-muted-foreground">{view.subjectName}</p>}
          </div>
          <Badge variant="secondary">{view.sections.length} sections</Badge>
        </div>
      </div>

      <StudyGuideView guide={view as unknown as StudyGuide} />
    </div>
  );
}