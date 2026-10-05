import type { AuditFields } from "./api.types";

export type NotificationType =
  | "training.completed"
  | "training.failed"
  | "document.indexed"
  | "document.failed"
  | "model.downloaded"
  | "chat.shared"
  | "collection.shared"
  | "system"
  | "admin";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface Notification extends AuditFields {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  meta?: Record<string, unknown>;
}

export interface NotificationPreferences {
  trainingUpdates: boolean;
  documentUpdates: boolean;
  modelUpdates: boolean;
  shareUpdates: boolean;
  systemUpdates: boolean;
  email: boolean;
}
