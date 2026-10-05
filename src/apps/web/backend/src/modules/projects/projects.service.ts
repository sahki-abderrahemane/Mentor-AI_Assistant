import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectMember, ProjectRole } from './entities/index.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projects: Repository<Project>,
    @InjectRepository(ProjectMember) private members: Repository<ProjectMember>,
  ) {}

  async findAll(userId: string, params: { page?: number; pageSize?: number; query?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);

    const qb = this.projects
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member', 'member.userId = :userId', { userId })
      .where('project.ownerId = :userId OR member.userId = :userId', { userId })
      .andWhere('project.archived = false');

    if (params.query) {
      qb.andWhere('project.name ILIKE :q', { q: `%${params.query}%` });
    }

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // Computed counters the UI renders on cards.
    const ids = items.map((p) => p.id);
    const withCounts = await this.attachCounts(items, ids);

    return { items: withCounts, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  private async attachCounts<T extends { id: string }>(items: T[], ids: string[]) {
    if (ids.length === 0) return items;
    try {
      const counts = await this.projects
        .createQueryBuilder('p')
        .leftJoin('p.collections', 'c')
        .leftJoin('c.documents', 'd')
        .leftJoin('p.conversations', 'conv')
        .select('p.id', 'id')
        .addSelect('COUNT(DISTINCT c.id)', 'collectionCount')
        .addSelect('COUNT(DISTINCT d.id)', 'documentCount')
        .addSelect('COUNT(DISTINCT conv.id)', 'conversationCount')
        .where('p.id IN (:...ids)', { ids })
        .groupBy('p.id')
        .getRawMany<{ id: string; collectionCount: string; documentCount: string; conversationCount: string }>();

      const byId = new Map(counts.map((c) => [c.id, c]));
      return items.map((item) => {
        const c = byId.get(item.id);
        return {
          ...item,
          collectionCount: Number(c?.collectionCount ?? 0),
          documentCount: Number(c?.documentCount ?? 0),
          conversationCount: Number(c?.conversationCount ?? 0),
        };
      });
    } catch {
      return items;
    }
  }

  async findById(id: string, userId: string) {
    const project = await this.projects.findOne({
      where: { id },
      relations: ['members', 'owner'],
    });
    if (!project) throw new NotFoundException('Project not found');
    const isMember = project.ownerId === userId || project.members?.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException();
    return project;
  }

  async create(userId: string, input: { name: string; description?: string; color?: string; icon?: string; tags?: string[] }) {
    const project = this.projects.create({ ...input, ownerId: userId });
    await this.projects.save(project);
    // Owner membership
    const member = this.members.create({ projectId: project.id, userId, role: ProjectRole.OWNER });
    await this.members.save(member);
    return project;
  }

  async update(id: string, userId: string, patch: Partial<Project>) {
    const project = await this.findById(id, userId);
    if (project.ownerId !== userId) throw new ForbiddenException('Only owner can update project');
    Object.assign(project, patch);
    return this.projects.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findById(id, userId);
    if (project.ownerId !== userId) throw new ForbiddenException('Only owner can delete project');
    await this.projects.remove(project);
  }
}