import type { AuditFields } from "./api.types";
import type { Permission } from "./auth.types";
import type { NotificationPreferences } from "./notifications.types";

export interface ApiKey extends AuditFields {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: string[];
  expiresAt?: string;
}

export interface Integration extends AuditFields {
  id: string;
  name: string;
  provider: string;
  connected: boolean;
  description?: string;
  configFields?: { key: string; label: string; type: string }[];
}

export interface UserSettings {
  appearance: {
    theme: "light" | "dark" | "system";
    density: "comfortable" | "compact";
    accentColor?: "blue" | "violet" | "green" | "amber";
    reduceMotion: boolean;
  };
  language: string;
  notifications: NotificationPreferences;
  privacy: {
    shareUsage: boolean;
    allowAnalytics: boolean;
    allowAIMemory: boolean;
  };
  defaults: {
    defaultModel: string;
    defaultCollectionId?: string;
  };
  permissions: Permission[];
}
