import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Document, KnowledgeUnit, DocumentProcessingEvent } from './entities/document.entity.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsProcessor } from './documents.processor.js';
import { AiProxyModule } from '../../shared/ai-proxy/ai-proxy.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, KnowledgeUnit, DocumentProcessingEvent]),
    BullModule.registerQueue({ name: 'documents' }),
    StorageModule,
    AiProxyModule,
    NotificationsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsProcessor],
  exports: [DocumentsService],
})
export class DocumentsModule {}