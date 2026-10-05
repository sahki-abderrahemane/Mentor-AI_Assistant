import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Document } from './entities/document.entity.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private repo: Repository<Document>,
    @InjectQueue('documents') private documentsQueue: Queue,
    private storage: StorageService,
  ) {}

  async findAll(params: {
    page?: number; pageSize?: number; query?: string;
    collectionId?: string; status?: string; fileType?: string; starred?: boolean;
  }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);

    const qb = this.repo.createQueryBuilder('doc');

    if (params.collectionId) qb.andWhere('doc.collectionId = :collectionId', { collectionId: params.collectionId });
    if (params.status) qb.andWhere('doc.status = :status', { status: params.status });
    if (params.fileType) qb.andWhere('doc.fileType = :fileType', { fileType: params.fileType });
    if (params.starred !== undefined) qb.andWhere('doc.starred = :starred', { starred: params.starred });
    if (params.query) qb.andWhere('doc.title ILIKE :q', { q: `%${params.query}%` });

    const [items, total] = await qb
      .skip((page - 1) * pageSize).take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async findById(id: string) {
    const doc = await this.repo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async upload(
    userId: string,
    collectionId: string,
    file: { path: string; filename: string; size: number; mimetype: string },
    metadata?: { title?: string; tags?: string[] },
  ) {
    const ext = file.filename.split('.').pop() ?? '';
    const fileTypeMap: Record<string, Document['fileType']> = {
      pdf: 'pdf', docx: 'docx', txt: 'txt', html: 'html', md: 'markdown', epub: 'epub',
    };
    console.log("uploading file", file.filename, "with type", fileTypeMap[ext] ?? 'other');
    const doc = this.repo.create({
      collectionId,
      uploadedById: userId,
      title: metadata?.title ?? file.filename,
      fileName: file.filename,
      fileType: fileTypeMap[ext] ?? 'other',
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      status: 'uploading',
      tags: metadata?.tags ?? [],
      stats: {
        pages: 0,
        words: 0,
        characters: 0,
        chunks: 0,
        citations: 0,
        size: file.size,
        readingTimeMin: 0,
      },
    });
    await this.repo.save(doc);
    console.log("saved document", doc.id, "with status", doc.status);
    // Enqueue processing job
    try {
      await this.documentsQueue.add('process-document', {
        documentId: doc.id,
        filePath: file.path,
      });
    } catch (queueErr) {
      console.error("failed to enqueue document processing job", queueErr instanceof Error ? queueErr.message : queueErr);
    }

    return doc;
  }

  async update(id: string, patch: Partial<Document>) {
    const doc = await this.findById(id);
    Object.assign(doc, patch);
    return this.repo.save(doc);
  }

  async remove(id: string) {
    const doc = await this.findById(id);
    try {
      await this.storage.deleteFile(doc.path);
    } catch (err) {
      console.error("failed to delete file", err instanceof Error ? err.message : err);
    }
    await this.repo.remove(doc);
  }

  async reindex(id: string) {
    const doc = await this.findById(id);
    doc.status = 'queued';
    doc.errorMessage = null;
    await this.repo.save(doc);
    await this.documentsQueue.add('process-document', { documentId: doc.id, filePath: doc.path });
    return doc;
  }

  async updateStatus(id: string, status: Document['status'], progress?: number, errorMessage?: string) {
    await this.repo.update(id, { status, progress, errorMessage });
  }
}