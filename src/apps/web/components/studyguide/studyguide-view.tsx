"use client";

import { BookOpen, HelpCircle, List, BookMarked, FileCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StudyGuide } from "@/types/studyguides.types";

interface StudyGuideViewProps {
  guide: StudyGuide;
}

const sectionIcons: Record<string, React.ReactNode> = {
  summary: <BookOpen className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
  key_concepts: <List className="h-4 w-4" />,
  glossary: <BookMarked className="h-4 w-4" />,
  practice: <FileCheck className="h-4 w-4" />,
};

function renderSectionContent(type: string, content: string) {
  switch (type) {
    case "summary":
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed">{para}</p>
          ))}
        </div>
      );

    case "key_concepts":
      return (
        <ul className="space-y-2">
          {content.split("\n\n").map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-sm leading-relaxed">{item.replace(/^-\s*/, "")}</span>
            </li>
          ))}
        </ul>
      );

    case "faq":
      return (
        <div className="space-y-4">
          {content.split("\n\n---\n\n").map((pair, i) => {
            const [q, ...a] = pair.split("\n\n");
            return (
              <div key={i} className="rounded-lg border p-4">
                <p className="font-medium text-sm mb-1">{q.replace(/^\*\*Q: /, "").replace(/\*\*$/, "")}</p>
                <p className="text-sm text-muted-foreground">{a.join(" ").replace(/^\*\*A: /, "").replace(/\*\*$/, "")}</p>
              </div>
            );
          })}
        </div>
      );

    case "glossary":
      return (
        <dl className="space-y-3">
          {content.split("\n\n").map((pair, i) => {
            const [term, ...defParts] = pair.split(" — ");
            return (
              <div key={i} className="grid grid-cols-[140px_1fr] gap-x-4 text-sm">
                <dt className="font-medium text-primary">{term.replace(/\*\*/g, "")}</dt>
                <dd className="text-muted-foreground">{defParts.join(" — ").replace(/\*\*/g, "")}</dd>
              </div>
            );
          })}
        </dl>
      );

    case "practice":
      return (
        <ol className="space-y-2">
          {content.split("\n\n").map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );

    default:
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }
}

export function StudyGuideView({ guide }: StudyGuideViewProps) {
  return (
    <div className="space-y-6">
      {guide.sections.map((section) => (
        <Card key={section.id} className="p-6">
          <div className="mb-4 flex items-center gap-2 font-semibold">
            <span className="text-primary">{sectionIcons[section.type]}</span>
            <h2>{section.title}</h2>
          </div>
          {renderSectionContent(section.type, section.content)}
        </Card>
      ))}
    </div>
  );
}