import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export type TrainingJobType = 'finetune' | 'continued_pretraining' | 'instruction_tuning';
export type TrainingStatus = 'queued' | 'preparing' | 'running' | 'evaluating' | 'completed' | 'failed' | 'cancelled' | 'paused';

@Entity('training_jobs')
export class TrainingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ name: 'base_model_id', nullable: true })
  baseModelId: string;

  @ManyToOne('Model', 'trainingJobs', { nullable: true })
  @JoinColumn({ name: 'base_model_id' })
  baseModel: any;

  @Column({ type: 'enum', enum: ['finetune', 'continued_pretraining', 'instruction_tuning'], nullable: true })
  type: TrainingJobType;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ name: 'remote_job_id', type: 'varchar', nullable: true })
  remoteJobId: string;

  @Column({ type: 'enum', enum: ['queued', 'preparing', 'running', 'evaluating', 'completed', 'failed', 'cancelled', 'paused'], default: 'queued' })
  status: TrainingStatus;

  @Column({ default: 0 })
  progress: number;

  @Column({ name: 'current_step', default: 0 })
  currentStep: number;

  @Column({ name: 'total_steps', default: 0 })
  totalSteps: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'duration_ms', nullable: true })
  durationMs: number;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Array<{ step: number; loss: number; learningRate: number; timestamp: string }>;

  @Column({ type: 'jsonb', nullable: true })
  evaluation: Array<{ metric: string; score: number; baseline?: number; delta?: number }>;

  @Column({ type: 'jsonb', nullable: true })
  gpus: Array<{ id: number; name: string; utilization: number; memoryUsed: number; memoryTotal: number; temperatureC: number }>;

  @Column({ type: 'jsonb', nullable: true })
  adapters: Array<{ id: string; name: string; size: number; baseModel: string; rank: number; alpha: number }>;

  @Column({ type: 'jsonb', nullable: true })
  logs: Array<{ timestamp: string; level: string; message: string }>;

  @Column({ default: false })
  starred: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export type ModelType = 'base' | 'instruct' | 'embedding' | 'reranker';
export type ModelStatus = 'available' | 'installed' | 'downloading' | 'updating' | 'error';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'repo_id', nullable: true })
  repoId: string;

  @Column()
  provider: string;

  @Column({ type: 'enum', enum: ['base', 'instruct', 'embedding', 'reranker'] })
  type: ModelType;

  @Column({ type: 'enum', enum: ['tiny', 'small', 'medium', 'large', 'xl'] })
  size: 'tiny' | 'small' | 'medium' | 'large' | 'xl';

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'context_window', nullable: true })
  contextWindow: number;

  @Column()
  parameters: string;

  @Column({ name: 'ram_requirement', nullable: true })
  ramRequirement: string;

  @Column({ name: 'vram_requirement', nullable: true })
  vramRequirement: string;

  @Column({ nullable: true })
  license: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  rating: number;

  @Column({ default: 0 })
  downloads: number;

  @Column({ default: 0 })
  pulls: number;

  @Column({ type: 'enum', enum: ['available', 'installed', 'downloading', 'updating', 'error'], default: 'available' })
  status: ModelStatus;

  @Column({ name: 'installed_at', nullable: true })
  installedAt: Date;

  @Column({ name: 'download_progress', nullable: true })
  downloadProgress: number;

  @Column({ nullable: true })
  error: string;

  @Column({ default: false })
  loaded: boolean;

  @Column({ default: false })
  default: boolean;

  @Column({ name: 'adapter_count', default: 0 })
  adapterCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('adapters')
export class Adapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['lora', 'qlora', 'prefix', 'prompt'] })
  type: 'lora' | 'qlora' | 'prefix' | 'prompt';

  @Column({ name: 'base_model_id' })
  baseModelId: string;

  @ManyToOne('Model', 'adapters')
  @JoinColumn({ name: 'base_model_id' })
  baseModel: any;

  @Column()
  rank: number;

  @Column()
  alpha: number;

  @Column()
  size: number;

  @Column({ name: 'download_url', nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: { loss?: number; eval?: number; perplexity?: number };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('merged_models')
export class MergedModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  size: number;

  @Column('simple-array', { name: 'base_model_ids' })
  baseModelIds: string[];

  @Column('simple-array')
  adapterIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}