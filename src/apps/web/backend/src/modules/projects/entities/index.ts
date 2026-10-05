import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum ProjectRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#6366f1' })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ default: false })
  starred: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('ProjectMember', 'project')
  members: ProjectMember[];

  @OneToMany('Collection', 'project')
  collections: Collection[];
}

@Entity('project_members')
export class ProjectMember {
  @PrimaryColumn({ name: 'project_id' })
  projectId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne('Project', 'members', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ProjectRole, default: ProjectRole.EDITOR })
  role: ProjectRole;
}

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne('Project', 'collections', { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: any;

  @Column({ type: 'enum', enum: ['ready', 'indexing', 'failed', 'paused'], default: 'indexing' })
  status: 'ready' | 'indexing' | 'failed' | 'paused';

  @Column({ default: false })
  starred: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}