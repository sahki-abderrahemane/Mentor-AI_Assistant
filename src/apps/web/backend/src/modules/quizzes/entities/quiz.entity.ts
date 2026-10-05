import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'subject_id', nullable: true })
  subjectId: string;

  @Column({ name: 'subject_name', nullable: true })
  subjectName: string;

  @Column({ name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes: number;

  @Column({ name: 'passing_score', default: 70 })
  passingScore: number;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: QuizStatus, default: QuizStatus.DRAFT })
  status: QuizStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Question', 'quiz')
  questions: Question[];

  @OneToMany('QuizAttempt', 'quiz')
  attempts: QuizAttempt[];
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @ManyToOne('Quiz', 'questions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: any;

  @Column({ type: 'enum', enum: ['multiple_choice', 'true_false', 'short_answer'] })
  type: QuestionType;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', nullable: true })
  options: Array<{ id: string; text: string; isCorrect: boolean }>;

  @Column({ name: 'correct_answer', nullable: true })
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ default: 1 })
  points: number;

  @Column()
  order: number;
}

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @ManyToOne('Quiz', 'attempts', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: any;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  score: number;

  @Column({ name: 'total_points' })
  totalPoints: number;

  @Column()
  percentage: number;

  @Column()
  passed: boolean;

  @Column({ name: 'time_spent_seconds' })
  timeSpentSeconds: number;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @OneToMany('QuizAnswer', 'attempt')
  answers: QuizAnswer[];
}

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attempt_id' })
  attemptId: string;

  @ManyToOne('QuizAttempt', 'answers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: any;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ type: 'text' })
  answer: string;

  @Column()
  correct: boolean;

  @Column({ name: 'points_earned' })
  pointsEarned: number;
}