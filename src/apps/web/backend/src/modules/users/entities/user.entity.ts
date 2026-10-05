import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../../../common/constants.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'boolean', default: false })
  suspended: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => ApiKey, (k) => k.user)
  apiKeys: ApiKey[];
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'refresh_token_hash' })
  refreshTokenHash: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.apiKeys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  prefix: string;

  @Column()
  hash: string;

  @Column('simple-array')
  scopes: string[];

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne('User', 'settings')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ type: 'jsonb', nullable: true })
  appearance: {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact';
    accentColor?: 'blue' | 'violet' | 'green' | 'amber';
    reduceMotion: boolean;
  };

  @Column({ default: 'en' })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  notifications: {
    trainingUpdates: boolean;
    documentUpdates: boolean;
    modelUpdates: boolean;
    shareUpdates: boolean;
    systemUpdates: boolean;
    email: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  privacy: {
    shareUsage: boolean;
    allowAnalytics: boolean;
    allowAIMemory: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  defaults: {
    defaultModel: string;
    defaultCollectionId?: string;
  };

  // Free-form extension point (e.g. integration connection state).
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;
}