import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Processor('projects')
export class ProjectsProcessor extends WorkerHost {
  constructor(@InjectQueue('projects') private projectsQueue: Queue) {
    super();
  }

  async process(job: { name: string; data: Record<string, unknown> }): Promise<void> {
    switch (job.name) {
      case 'delete-project':
        // Cascade delete collections handled by DB foreign key CASCADE
        break;
    }
  }
}