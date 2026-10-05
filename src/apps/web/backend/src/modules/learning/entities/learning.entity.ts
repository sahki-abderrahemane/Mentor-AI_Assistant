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

export enum SessionType {
  QUIZ = 'quiz',
  FLASHCARD = 'flashcard',
  STUDY_GUIDE = 'study_guide',
  CHAT = 'chat',
}

@Entity('study_sessions')
@Index(['userId'])
export class StudySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'studySessions')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ type: 'enum', enum: SessionType })
  type: SessionType;

  @Column({ name: 'topic_id', nullable: true })
  topicId: string;

  @Column({ name: 'duration_minutes', default: 0 })
  durationMinutes: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('learning_streaks')
export class LearningStreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ManyToOne('User', 'streaks')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', default: 0 })
  longestStreak: number;

  @Column({ name: 'last_active_date', nullable: true })
  lastActiveDate: Date;

  @Column({ name: 'study_goal_minutes_per_day', default: 30 })
  studyGoalMinutesPerDay: number;

  @Column({ name: 'study_minutes_today', default: 0 })
  studyMinutesToday: number;
}

@Entity('topic_masteries')
@Index(['userId'])
export class TopicMastery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'topicMasteries')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ name: 'topic_name' })
  topicName: string;

  @Column({ name: 'mastery_percentage', default: 0 })
  masteryPercentage: number;

  @Column({ name: 'quizzes_taken', default: 0 })
  quizzesTaken: number;

  @Column({ name: 'average_score', default: 0 })
  averageScore: number;

  @Column({ name: 'cards_reviewed', default: 0 })
  cardsReviewed: number;

  @Column({ name: 'last_studied_at', nullable: true })
  lastStudiedAt: Date;
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  icon: string;

  @Column({ type: 'text' })
  criteria: string;

  @OneToMany('UserAchievement', 'achievement')
  userAchievements: UserAchievement[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'achievement_id' })
  achievementId: string;

  @ManyToOne('User', 'achievements')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Achievement', 'userAchievements')
  @JoinColumn({ name: 'achievement_id' })
  achievement: any;

  @Column({ name: 'unlocked_at', nullable: true })
  unlockedAt: Date;
}

@Entity('study_guides')
export class StudyGuide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ nullable: true, name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ nullable: true, name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ default: 'draft' })
  status: string;

  @Column({ nullable: true, name: 'generated_at' })
  generatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}