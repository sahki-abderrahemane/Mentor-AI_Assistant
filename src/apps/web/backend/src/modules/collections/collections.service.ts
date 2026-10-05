import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../projects/entities/index.js';

@Injectable()
export class CollectionsService {
  constructor(@InjectRepository(Collection) private repo: Repository<Collection>) {}

  async findAll(userId: string, params: { page?: number; pageSize?: number; query?: string; projectId?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);

    const qb = this.repo.createQueryBuilder('col')
      .innerJoin('col.project', 'project')
      .innerJoin('project.members', 'member', 'member.userId = :userId', { userId });

    if (params.projectId) qb.andWhere('col.projectId = :projectId', { projectId: params.projectId });
    if (params.query) qb.andWhere('col.name ILIKE :q', { q: `%${params.query}%` });

    const [items, total] = await qb
      .skip((page - 1) * pageSize).take(pageSize)
      .getManyAndCount();

    const ids = items.map((c) => c.id);
    const withCounts = await this.attachCounts(items, ids);

    return { items: withCounts, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  private async attachCounts<T extends { id: string }>(items: T[], ids: string[]) {
    if (ids.length === 0) return items;
    try {
      const counts = await this.repo.manager
        .createQueryBuilder()
        .select('d."collectionId"', 'id')
        .addSelect('COUNT(d.id)', 'documentCount')
        .addSelect('COALESCE(SUM(d.size), 0)', 'totalSize')
        .addSelect(`COALESCE(SUM((d.stats->>'citations')::int), 0)`, 'citationCount')
        .from('documents', 'd')
        .where('d."collectionId" IN (:...ids)', { ids })
        .groupBy('d."collectionId"')
        .getRawMany<{ id: string; documentCount: string; totalSize: string; citationCount: string }>();

      const byId = new Map(counts.map((c) => [c.id, c]));
      return items.map((item) => {
        const c = byId.get(item.id);
        return {
          ...item,
          documentCount: Number(c?.documentCount ?? 0),
          totalSize: Number(c?.totalSize ?? 0),
          citationCount: Number(c?.citationCount ?? 0),
        };
      });
    } catch {
      return items;
    }
  }

  async findById(id: string) {
    const col = await this.repo.findOne({ where: { id } });
    if (!col) throw new NotFoundException('Collection not found');
    return col;
  }

  async create(userId: string, input: { projectId: string; name: string; description?: string; icon?: string; tags?: string[] }) {
    const col = this.repo.create(input);
    return this.repo.save(col);
  }

  async update(id: string, patch: Partial<Collection>) {
    const col = await this.findById(id);
    Object.assign(col, patch);
    return this.repo.save(col);
  }

  async remove(id: string) {
    const col = await this.findById(id);
    await this.repo.remove(col);
  }
}