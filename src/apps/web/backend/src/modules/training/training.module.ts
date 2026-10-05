import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingJob, Model, Adapter, MergedModel } from './entities/training.entity.js';
import { TrainingController } from './training.controller.js';
import { TrainingService } from './training.service.js';
import { AiProxyModule } from '../../shared/ai-proxy/ai-proxy.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingJob, Model, Adapter, MergedModel]),
    AiProxyModule,
    NotificationsModule,
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}