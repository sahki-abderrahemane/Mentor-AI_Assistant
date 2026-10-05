import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StudyGuide, StudySession, LearningStreak,
  TopicMastery, Achievement, UserAchievement, SessionType,
} from './entities/learning.entity.js';
import { QuizAttempt } from '../quizzes/entities/quiz.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Conversation } from '../chat/entities/chat.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(StudyGuide) private guides: Repository<StudyGuide>,
    @InjectRepository(StudySession) private sessions: Repository<StudySession>,
    @InjectRepository(LearningStreak) private streaks: Repository<LearningStreak>,
    @InjectRepository(TopicMastery) private mastery: Repository<TopicMastery>,
    @InjectRepository(Achievement) private achievements: Repository<Achievement>,
    @InjectRepository(UserAchievement) private userAchievements: Repository<UserAchievement>,
    @InjectRepository(QuizAttempt) private attempts: Repository<QuizAttempt>,
    @InjectRepository(Document) private documents: Repository<Document>,
    @InjectRepository(Conversation) private conversations: Repository<Conversation>,
    private notifications: NotificationsService,
  ) {}

  async getStreak(userId: string) {
    let streak = await this.streaks.findOne({ where: { userId } });
    if (!streak) {
      streak = this.streaks.create({ userId, currentStreak: 0, longestStreak: 0 });
      await this.streaks.save(streak);
    }
    return streak;
  }

  async updateStreak(userId: string) {
    const streak = await this.getStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const diffDays = lastActive ? Math.floor((today.getTime() - lastActive.getTime()) / 86400000) : 999;
    if (diffDays === 0) return streak;
    if (diffDays === 1) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastActiveDate = today;
    return this.streaks.save(streak);
  }

  async startSession(userId: string, data: { type?: string; subjectId?: string; topicId?: string }) {
    const sessionType = data.type ? (data.type as SessionType) : SessionType.CHAT;
    const session = new StudySession();
    session.userId = userId;
    session.type = sessionType;
    session.startedAt = new Date();
    if (data.topicId) session.topicId = data.topicId;
    return this.sessions.save(session);
  }

  async endSession(userId: string, sessionId: string, data: { durationMinutes: number }) {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Session not found');
    session.endedAt = new Date();
    session.durationMinutes = data.durationMinutes;
    await this.sessions.save(session);
    await this.updateStreak(userId);
    void this.evaluateAchievements(userId);
    return session;
  }

  async getMastery(userId: string, topicName?: string) {
    const qb = this.mastery.createQueryBuilder('m').where('m.userId = :userId', { userId });
    if (topicName) qb.andWhere('m.topicName = :topicName', { topicName });
    return qb.getMany();
  }

  /**
   * Upsert topic mastery after a quiz attempt.
   */
  async recordQuizResult(userId: string, topicName: string, percentage: number, passed: boolean) {
    let row = await this.mastery.findOne({ where: { userId, topicName } });
    if (!row) {
      row = this.mastery.create({ userId, topicName, masteryPercentage: 0 });
    }
    const attempts = row.quizzesTaken + 1;
    row.quizzesTaken = attempts;
    row.averageScore = Math.round(
      ((row.averageScore * (attempts - 1)) + percentage) / attempts,
    );
    // Mastery blends the running average with recency of a pass/fail signal.
    const passBonus = passed ? 10 : -5;
    row.masteryPercentage = Math.max(0, Math.min(100,
      Math.round(row.averageScore * 0.8 + 20 * Math.min(attempts, 5) / 5) + passBonus,
    ));
    row.lastStudiedAt = new Date();
    await this.mastery.save(row);
    return row;
  }

  /**
   * Count a flashcard review toward the deck's subject mastery.
   */
  async recordCardReview(userId: string, topicName: string) {
    let row = await this.mastery.findOne({ where: { userId, topicName } });
    if (!row) {
      row = this.mastery.create({ userId, topicName, masteryPercentage: 0 });
    }
    row.cardsReviewed += 1;
    row.lastStudiedAt = new Date();
    if (row.masteryPercentage < 40) {
      row.masteryPercentage = Math.min(40, row.masteryPercentage + 1);
    }
    await this.mastery.save(row);
    return row;
  }

  /**
   * Evaluate every achievement's `metric >= threshold` criteria against live
   * counters and unlock the ones the user now qualifies for. Returns newly
   * unlocked achievements.
   */
  async evaluateAchievements(userId: string): Promise<Achievement[]> {
    const all = await this.achievements.find();
    const owned = await this.userAchievements.find({ where: { userId } });
    const ownedIds = new Set(owned.map((ua) => ua.achievementId));

    const [streakRow, sessionCount, perfectQuizzes, documentsRead, sharedConversations] =
      await Promise.all([
        this.streaks.findOne({ where: { userId } }),
        this.sessions.count({ where: { userId } }),
        this.attempts.count({ where: { userId, percentage: 100 } }),
        this.documents.count({ where: { uploadedById: userId, status: 'ready' as never } }),
        this.conversations.count({ where: { userId, starred: true } }),
      ]);

    const metrics: Record<string, number> = {
      lessons_completed: sessionCount,
      perfect_quizzes: perfectQuizzes,
      documents_read: documentsRead,
      streak_days: streakRow?.longestStreak ?? 0,
      conversations_shared: sharedConversations,
    };

    const unlocked: Achievement[] = [];
    for (const achievement of all) {
      if (ownedIds.has(achievement.id)) continue;
      const match = /^(.+?)\s*>=\s*(\d+)$/.exec((achievement.criteria ?? '').trim());
      if (!match) continue;
      const metric = metrics[match[1].trim()];
      const threshold = Number(match[2]);
      if (metric === undefined || metric < threshold) continue;

      const ua = this.userAchievements.create({
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date(),
      });
      await this.userAchievements.save(ua);
      unlocked.push(achievement);
      void this.notifications.create({
        userId,
        type: 'system',
        severity: 'success',
        title: `Achievement unlocked: ${achievement.title}`,
        message: achievement.description ?? '',
        actionUrl: '/progress',
        actionLabel: 'View progress',
      });
    }
    return unlocked;
  }

  async getAchievements(userId: string) {
    return this.userAchievements.find({ where: { userId }, relations: ['achievement'] });
  }

  async getAllAchievements() {
    return this.achievements.find();
  }

  async getProgress(userId: string) {
    const [sessions, mastery, achievements] = await Promise.all([
      this.sessions.find({ where: { userId } }),
      this.mastery.find({ where: { userId } }),
      this.userAchievements.find({ where: { userId }, relations: ['achievement'] }),
    ]);
    return {
      totalSessions: sessions.length,
      totalDurationMinutes: sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0),
      masteryCount: mastery.length,
      averageMastery: mastery.length > 0
        ? Math.round(mastery.reduce((s, m) => s + m.masteryPercentage, 0) / mastery.length)
        : 0,
      achievementsUnlocked: achievements.length,
    };
  }
}