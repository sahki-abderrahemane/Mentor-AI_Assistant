import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findAll(params: { page?: number; pageSize?: number; query?: string; role?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.repo.createQueryBuilder('user');

    if (params.query) {
      qb.where('user.name ILIKE :q OR user.email ILIKE :q', { q: `%${params.query}%` });
    }
    if (params.role) {
      qb.andWhere('user.role = :role', { role: params.role });
    }

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: items.map((u) => this.sanitize(u)),
      total,
      page,
      pageSize,
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    };
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, patch: { name?: string; email?: string; bio?: string; avatarUrl?: string }) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (patch.name) user.name = patch.name;
    if (patch.email) user.email = patch.email;
    if (patch.bio !== undefined) user.bio = patch.bio;
    if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl;
    await this.repo.save(user);
    return this.sanitize(user);
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.repo.save(user);
  }

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}