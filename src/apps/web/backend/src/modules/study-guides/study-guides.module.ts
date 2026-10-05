import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyGuide } from '../learning/entities/learning.entity.js';
import { StudyGuidesController } from './study-guides.controller.js';
import { StudyGuidesService } from './study-guides.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudyGuide])],
  controllers: [StudyGuidesController],
  providers: [StudyGuidesService],
  exports: [StudyGuidesService],
})
export class StudyGuidesModule {}