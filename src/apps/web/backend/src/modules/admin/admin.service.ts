import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Session } from '../users/entities/user.entity.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Session) private sessions: Repository<Session>,
    @InjectDataSource() private db: DataSource,
  ) {}

  async getUsers(params: { page?: number; pageSize?: number; search?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 50, 200);
    const qb = this.users.createQueryBuilder('u');
    if (params.search) qb.andWhere('u.email ILIKE :q OR u.name ILIKE :q', { q: `%${params.search}%` });
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async getStats() {
    const [userCount] = await this.users.createQueryBuilder().select('COUNT(*)').getRawOne();
    const [sessionCount] = await this.sessions.createQueryBuilder().select('COUNT(*)').getRawOne();
    return { userCount, sessionCount };
  }

  async suspendUser(userId: string) {
    await this.users.update(userId, { suspended: true } as never);
  }

  async unsuspendUser(userId: string) {
    await this.users.update(userId, { suspended: false } as never);
  }

  async deleteUser(userId: string) {
    await this.users.delete(userId);
  }

  async getLogs(limit: number) {
    return {
      items: [],
      total: 0,
      note: 'Log aggregation not yet configured',
    };
  }

  async getLearningAnalytics() {
    const userCount = await this.users.createQueryBuilder().select('COUNT(*)', 'count').getRawOne<{ count: string }>();
    let sessionCount = 0;
    try {
      const r = await this.db.query('SELECT COUNT(*) as count FROM study_sessions');
      sessionCount = parseInt(r[0]?.count ?? 0);
    } catch { /* table may not exist */ }
    return {
      totalUsers: parseInt(userCount?.count ?? '0'),
      totalSessions: sessionCount,
      totalDocuments: 0,
      totalConversations: 0,
      averageMastery: 0,
    };
  }
}