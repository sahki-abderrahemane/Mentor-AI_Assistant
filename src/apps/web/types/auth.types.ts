import type { AuditFields } from "./api.types";
import type { PERMISSIONS } from "@/lib/constants";

export type UserRole = "admin" | "member" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  bio?: string;
  lastActiveAt?: string;
  createdAt?: string;
  joinDate?: string;
}

export type Permission = (typeof PERMISSIONS)[number];

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  permissions: Permission[];
  expiresAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface EmailVerificationInput {
  token: string;
}

export interface AuthProviderInfo {
  id: "google" | "github" | "microsoft" | "apple";
  label: string;
  enabled: boolean;
}

export interface SessionDevice extends AuditFields {
  id: string;
  userAgent: string;
  ip: string;
  location: string;
  current: boolean;
  lastActiveAt: string;
}
