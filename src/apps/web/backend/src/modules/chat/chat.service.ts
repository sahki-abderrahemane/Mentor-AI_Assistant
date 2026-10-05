import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message } from './entities/chat.entity.js';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private conversations: Repository<Conversation>,
    @InjectRepository(Message) private messages: Repository<Message>,
  ) {}

  async findAllConversations(userId: string, params: { page?: number; pageSize?: number; query?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.conversations.createQueryBuilder('conv')
      .where('conv.userId = :userId', { userId })
      .andWhere('conv.archived = false');

    if (params.query) qb.andWhere('conv.title ILIKE :q', { q: `%${params.query}%` });

    const [items, total] = await qb
      .skip((page - 1) * pageSize).take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async findConversationById(id: string, userId: string) {
    const conv = await this.conversations.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async createConversation(userId: string, input: { title?: string; model?: string; projectId?: string }) {
    const conv = this.conversations.create({
      ...input,
      userId,
      title: input.title ?? 'New conversation',
    });
    return this.conversations.save(conv);
  }

  async updateConversation(id: string, userId: string, patch: Partial<Conversation>) {
    const conv = await this.findConversationById(id, userId);
    Object.assign(conv, patch);
    return this.conversations.save(conv);
  }

  async deleteConversation(id: string, userId: string) {
    const conv = await this.findConversationById(id, userId);
    await this.conversations.remove(conv);
  }

  async getMessages(conversationId: string, userId: string) {
    await this.findConversationById(conversationId, userId);
    return this.messages.find({ where: { conversationId }, order: { createdAt: 'ASC' } });
  }

  async saveMessage(conversationId: string, userId: string, data: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    citations?: unknown[];
    meta?: { inputTokens?: number; outputTokens?: number; latencyMs?: number };
  }) {
    const conv = await this.findConversationById(conversationId, userId);
    const msg = this.messages.create({ ...data, conversationId });
    await this.messages.save(msg);
    conv.messageCount += 1;
    await this.conversations.save(conv);
    return msg;
  }

  async findFolders(userId: string) {
    return this.conversations.find({ where: { userId }, select: ['folder', 'id'] });
  }
}