export interface GuideSectionView {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}

export interface StudyGuideView {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  description: string | null;
  sections: GuideSectionView[];
  subjectName: string | null;
  wordCount: number;
}

interface RawGuide {
  id?: string;
  title?: string;
  content?: string | null;
  description?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  status?: string | null;
  sections?: Array<{
    id?: string;
    type?: string;
    title?: string;
    content?: string;
    order?: number;
  }> | null;
  metadata?: Record<string, unknown> | null;
  generatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const ATX_HEADING_RE = /^#{1,3}\s+(.+)$/gm;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseMarkdownSections(content: string): GuideSectionView[] {
  const matches = [...content.matchAll(ATX_HEADING_RE)];
  if (matches.length === 0) {
    const body = content.trim();
    if (!body) return [];
    return [{ id: "overview", type: "summary", title: "Overview", content: body, order: 1 }];
  }
  return matches.map((match, i) => {
    const start = (match.index ?? 0) + match[0].length;
    const next = matches[i + 1]?.index ?? content.length;
    return {
      id: `section-${i + 1}`,
      type: "summary",
      title: match[1].trim(),
      content: content.slice(start, next).trim(),
      order: i + 1,
    };
  });
}

function truncate(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}…`;
}

export function toStudyGuideView(guide: unknown): StudyGuideView {
  if (!guide || typeof guide !== "object") {
    return {
      id: "",
      title: "",
      status: "",
      updatedAt: "",
      createdAt: "",
      description: null,
      sections: [],
      subjectName: null,
      wordCount: 0,
    };
  }

  const g = guide as RawGuide;
  const metadata = (g.metadata && typeof g.metadata === "object" ? g.metadata : {}) as Record<string, unknown>;

  const rawSections = Array.isArray(g.sections)
    ? g.sections
        .filter((s) => s && typeof s === "object")
        .map((s, i) => ({
          id: asString(s.id) ?? `section-${i + 1}`,
          type: asString(s.type) ?? "summary",
          title: asString(s.title) ?? `Section ${i + 1}`,
          content: typeof s.content === "string" ? s.content : "",
          order: typeof s.order === "number" ? s.order : i + 1,
        }))
        .sort((a, b) => a.order - b.order)
    : [];

  const content = typeof g.content === "string" ? g.content : "";
  const sections = rawSections.length > 0 ? rawSections : parseMarkdownSections(content);

  const metaSummary = asString(metadata.summary);
  const description = asString(g.description) ?? (metaSummary ? truncate(metaSummary, 160) : content ? truncate(content, 160) : null);

  const subjectName =
    asString(metadata.subjectName) ?? asString(metadata.subject_name) ?? asString(g.subjectName);

  const wordCount = (content.trim().match(/\S+/g) ?? []).length ||
    sections.reduce((acc, s) => acc + (s.content.trim().match(/\S+/g) ?? []).length, 0);

  return {
    id: asString(g.id) ?? "",
    title: asString(g.title) ?? "Untitled guide",
    status: asString(g.status) ?? "ready",
    updatedAt: asString(g.updatedAt) ?? asString(g.generatedAt) ?? asString(g.createdAt) ?? "",
    createdAt: asString(g.createdAt) ?? "",
    description,
    sections,
    subjectName,
    wordCount,
  };
}
