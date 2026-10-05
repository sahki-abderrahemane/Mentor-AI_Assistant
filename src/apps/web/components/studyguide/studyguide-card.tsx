"use client";

import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudyGuide } from "@/types/studyguides.types";

interface StudyGuideCardProps {
  guide: StudyGuide;
}

export function StudyGuideCard({ guide }: StudyGuideCardProps) {
  return (
    <Link href={`/study-guides/${guide.id}`}>
      <Card className="group cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {guide.sections.length} sections
          </Badge>
        </div>

        <h3 className="mb-1 font-semibold leading-tight group-hover:text-primary">
          {guide.title}
        </h3>
        {guide.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{guide.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {guide.sections.map((s) => (
            <Badge key={s.id} variant="outline" className="text-xs">
              {s.type.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}