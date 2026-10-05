import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Document, KnowledgeUnit } from './entities/document.entity.js';
import { AiProxyService } from '../../shared/ai-proxy/ai-proxy.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Processor('documents')
export class DocumentsProcessor extends WorkerHost {
  constructor(
    @InjectQueue('documents') private documentsQueue: Queue,
    @InjectRepository(Document) private documentsRepo: Repository<Document>,
    @InjectRepository(KnowledgeUnit) private knowledgeRepo: Repository<KnowledgeUnit>,
    private aiProxy: AiProxyService,
    private notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: { name: string; data: Record<string, unknown> }): Promise<void> {
    switch (job.name) {
      case 'process-document':
        await this.processDocument(job.data as { documentId: string; filePath: string });
        break;
      case 'reindex-document':
        await this.processDocument(job.data as { documentId: string; filePath: string });
        break;
    }
  }

  private async processDocument(data: { documentId: string; filePath: string }) {
    const { documentId, filePath } = data;

    try {
      await this.documentsRepo.update(documentId, { status: 'processing', progress: 10 });

      const source = await this.documentsRepo.findOne({ where: { id: documentId } });

      // Step 1: Process PDF → Knowledge Units
      const { knowledgeUnits, metadata } = await this.aiProxy.processPdf(filePath, documentId, source?.title);

      // Remove any previously indexed chunks for this document so reindexes replace (not append)
      await this.aiProxy.removeDocument(documentId);
      await this.knowledgeRepo.delete({ documentId });
      await this.documentsRepo.update(documentId, { progress: 30 });

      // Persist the extracted chunks so downstream features (AI generation,
      // previews) can read them from Postgres.
      if (knowledgeUnits.length > 0) {
        const kuRows: KnowledgeUnit[] = knowledgeUnits.map((ku: Record<string, unknown>, i: number) => ({
          documentId,
          unitNumber: i + 1,
          text: String(ku.text ?? ''),
          section: (ku.section as { title?: string } | null)?.title ?? null,
          subsection: (ku.subsection as string | null) ?? null,
          pageStart: (ku.pageStart as number | null) ?? null,
          pageEnd: (ku.pageEnd as number | null) ?? null,
          wordCount: (ku.wordCount as number | null) ??
            String(ku.text ?? '').split(/\s+/).filter(Boolean).length,
        })) as KnowledgeUnit[];
        await this.knowledgeRepo.save(kuRows);
      }
      await this.documentsRepo.update(documentId, { progress: 40 });

      // Step 2: Batch embed texts
      const texts = knowledgeUnits.map((ku: Record<string, unknown>) => (typeof ku.text === 'string' ? ku.text : '')).filter((t: string) => t.length > 0);
      const embeddings = await this.aiProxy.generateEmbedding(texts);
      await this.documentsRepo.update(documentId, { progress: 70 });

      // Step 3: Index chunks to vector store
      await this.aiProxy.indexChunks(knowledgeUnits, embeddings);
      await this.documentsRepo.update(documentId, { progress: 90 });

      // Step 4: Update document as ready
      const meta = (metadata ?? {}) as Record<string, unknown>;
      const stats = (metadata?.statistics as Record<string, number>) ?? {};
      const pageCount = stats.page_count ?? (meta.pageCount as number) ?? 0;
      const wordCount =
        stats.word_count ??
        (meta.wordCount as number) ??
        knowledgeUnits.reduce((sum: number, ku: Record<string, unknown>) => sum + (ku.wordCount as number ?? 0), 0);

      const prefixText = texts[0] ? texts[0].replace(/\s+/g, ' ').trim().slice(0, 500) : null;
      const abstract = prefixText;
      const preview = texts.length > 0 ? { text: texts.slice(0, 8).join('\n\n').slice(0, 6000), pageCount } : null;

      await this.documentsRepo.update(documentId, {
        status: 'ready',
        progress: 100,
        indexedAt: new Date(),
        errorMessage: null,
        ...(abstract ? { abstract } : {}),
        ...(preview ? { preview } : {}),
        stats: {
          pages: pageCount,
          words: wordCount,
          characters: stats.character_count ?? 0,
          chunks: knowledgeUnits.length,
          citations: 0,
          size: 0,
          readingTimeMin: Math.ceil(wordCount / 200),
        },
      });

      const doc = await this.documentsRepo.findOne({ where: { id: documentId } });
      if (doc) {
        void this.notifications.create({
          userId: doc.uploadedById,
          type: 'document_indexed',
          severity: 'success',
          title: `Document indexed: ${doc.title}`,
          message: 'Your document is now searchable.',
          actionUrl: `/documents/${doc.id}`,
          actionLabel: 'Open document',
        });
      }

    } catch (error) {
      await this.documentsRepo.update(documentId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
      });
      const doc = await this.documentsRepo.findOne({ where: { id: documentId } }).catch(() => null);
      if (doc) {
        void this.notifications.create({
          userId: doc.uploadedById,
          type: 'document_failed',
          severity: 'error',
          title: `Document processing failed: ${doc.title}`,
          message: error instanceof Error ? error.message : 'Processing failed',
          actionUrl: `/documents/${doc.id}`,
          actionLabel: 'Open document',
        });
      }
    }
  }
}