import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGuide } from '../learning/entities/learning.entity.js';

@Injectable()
export class StudyGuidesService {
  constructor(@InjectRepository(StudyGuide) private repo: Repository<StudyGuide>) {}

  async findAll(params: { page?: number; pageSize?: number; subjectId?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.repo.createQueryBuilder('guide');
    if (params.subjectId) qb.andWhere('guide.subjectId = :subjectId', { subjectId: params.subjectId });
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async findById(id: string) {
    const guide = await this.repo.findOne({ where: { id } });
    if (!guide) throw new NotFoundException('Study guide not found');
    return guide;
  }
}