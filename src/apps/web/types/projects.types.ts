import type { AuditFields } from "./api.types";

export interface Project extends AuditFields {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  ownerId: string;
  memberIds: string[];
  collectionCount: number;
  documentCount: number;
  conversationCount: number;
  starred: boolean;
  archived: boolean;
  lastActivityAt?: string;
  tags?: string[];
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "owner" | "editor" | "viewer";
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tags?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  starred?: boolean;
  archived?: boolean;
  tags?: string[];
}
