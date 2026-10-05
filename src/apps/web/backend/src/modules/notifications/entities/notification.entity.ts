import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export type NotificationType =
  | 'training_completed'
  | 'training_failed'
  | 'document_indexed'
  | 'document_failed'
  | 'model_downloaded'
  | 'chat_shared'
  | 'collection_shared'
  | 'system'
  | 'admin';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

@Entity('notifications')
@Index(['userId', 'read'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'notifications')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({
    type: 'enum',
    enum: [
      'training_completed',
      'training_failed',
      'document_indexed',
      'document_failed',
      'model_downloaded',
      'chat_shared',
      'collection_shared',
      'system',
      'admin',
    ],
  })
  type: NotificationType;

  @Column({ type: 'enum', enum: ['info', 'success', 'warning', 'error'] })
  severity: NotificationSeverity;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ name: 'action_url', nullable: true })
  actionUrl: string;

  @Column({ name: 'action_label', nullable: true })
  actionLabel: string;

  @Column({ name: 'actor_id', nullable: true })
  actorId: string;

  @Column({ name: 'actor_name', nullable: true })
  actorName: string;

  @Column({ name: 'actor_avatar', nullable: true })
  actorAvatar: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}