export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MentorAI";

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
} as const;

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/html": [".html", ".htm"],
  "text/markdown": [".md", ".markdown"],
} as const;

export const ACCEPTED_FILE_EXTENSIONS = [
  "pdf",
  "docx",
  "txt",
  "html",
  "htm",
  "md",
  "markdown",
] as const;

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export const STORAGE_KEYS = {
  AUTH: "mentorai.auth",
  PREFERENCES: "mentorai.preferences",
  RECENT_CONVERSATIONS: "mentorai.recent.conversations",
} as const;

export const ROLES = ["admin", "member", "viewer"] as const;

export const PERMISSIONS = [
  "documents.read",
  "documents.write",
  "documents.delete",
  "collections.write",
  "projects.write",
  "chat.send",
  "training.run",
  "models.manage",
  "admin.access",
] as const;

export const THEME_OPTIONS = ["light", "dark", "system"] as const;
