import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('conversations')
@Index(['userId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  folder: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne('Project', 'conversations', { nullable: true })
  project: any;

  @Column({ default: 'llama-3.1-8b' })
  model: string;

  @Column({ default: false })
  starred: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  shared: boolean;

  @Column({ name: 'message_count', default: 0 })
  messageCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Message', 'conversation')
  messages: Message[];

  @OneToMany('ConversationFolder', 'conversations')
  folders: ConversationFolder[];
}

@Entity('messages')
@Index(['conversationId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne('Conversation', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ type: 'enum', enum: ['user', 'assistant', 'system'] })
  role: 'user' | 'assistant' | 'system';

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'jsonb', nullable: true })
  citations: unknown[];

  @Column({ name: 'is_streaming', default: false })
  isStreaming: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('conversation_folders')
export class ConversationFolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Conversation', 'folders')
  conversations: Conversation[];
}