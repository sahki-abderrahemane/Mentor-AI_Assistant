export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const PERMISSIONS = [
  'documents.read',
  'documents.write',
  'documents.delete',
  'collections.write',
  'projects.write',
  'chat.send',
  'training.run',
  'models.manage',
  'admin.access',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [...PERMISSIONS],
  [UserRole.MEMBER]: ['documents.read', 'documents.write', 'collections.write', 'projects.write', 'chat.send', 'training.run'],
  [UserRole.VIEWER]: ['documents.read'],
};