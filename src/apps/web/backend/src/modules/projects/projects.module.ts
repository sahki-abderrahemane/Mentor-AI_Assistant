import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Project, ProjectMember } from './entities/index.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsProcessor } from './projects.processor.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember]),
    BullModule.registerQueue({ name: 'projects' }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsProcessor],
  exports: [ProjectsService],
})
export class ProjectsModule {}