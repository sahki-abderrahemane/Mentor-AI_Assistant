import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notifs: Repository<Notification>) {}

  /**
   * Fire-and-forget producer used by other modules (training, documents,
   * achievements…). Never throws — a notification failure must not break
   * the calling flow.
   */
  async create(input: {
    userId: string;
    type: Notification['type'];
    title: string;
    message: string;
    severity?: Notification['severity'];
    actionUrl?: string;
    actionLabel?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const n = this.notifs.create({
        userId: input.userId,
        type: input.type,
        severity: input.severity ?? 'info',
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        meta: input.meta,
      });
      await this.notifs.save(n);
    } catch {
      // swallow — notifications are best-effort
    }
  }

  async findAll(userId: string, params: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.notifs.createQueryBuilder('n').where('n.userId = :userId', { userId });
    if (params.unreadOnly) qb.andWhere('n.read = false');
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notifs.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.read = true;
    return this.notifs.save(notif);
  }

  async markAllAsRead(userId: string) {
    await this.notifs.update({ userId, read: false }, { read: true });
  }

  async delete(id: string, userId: string) {
    const notif = await this.notifs.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    await this.notifs.remove(notif);
  }

  async getUnreadCount(userId: string) {
    return this.notifs.count({ where: { userId, read: false } });
  }
}