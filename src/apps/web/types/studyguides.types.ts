import type { AuditFields } from "./api.types";

export interface StudyGuideSection {
  id: string;
  type: "summary" | "key_concepts" | "faq" | "glossary" | "practice";
  title: string;
  content: string;
  order: number;
}

export interface StudyGuide {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description?: string;
  sourceIds: string[];
  sections: StudyGuideSection[];
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}