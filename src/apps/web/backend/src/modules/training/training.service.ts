import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingJob, Model, Adapter, MergedModel, TrainingStatus } from './entities/training.entity.js';
import { AiProxyService } from '../../shared/ai-proxy/ai-proxy.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

interface RemoteJobStatus {
  status: string;
  progress?: number;
  current_step?: number;
  total_steps?: number;
  error?: string | null;
  adapter_path?: string | null;
  final_metrics?: Record<string, number | string> | null;
}

const TERMINAL = new Set(['completed', 'failed', 'cancelled']);

@Injectable()
export class TrainingService implements OnModuleInit {
  private pollers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(
    @InjectRepository(TrainingJob) private jobs: Repository<TrainingJob>,
    @InjectRepository(Model) private models: Repository<Model>,
    @InjectRepository(Adapter) private adapters: Repository<Adapter>,
    @InjectRepository(MergedModel) private merged: Repository<MergedModel>,
    private aiProxy: AiProxyService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Resume polling for jobs that were in flight when the API restarted
   * (the pollers live in memory).
   */
  onModuleInit() {
    this.jobs
      .find({ where: [{ status: 'preparing' as never }, { status: 'running' as never }] })
      .then((active) => {
        for (const job of active) {
          if (job.remoteJobId) this.pollRemote(job.id);
        }
      })
      .catch(() => undefined);
  }

  async createJob(userId: string, data: {
    baseModelId: string;
    datasetSource?: string;
    hyperparameters?: Record<string, unknown>;
  }) {
    if (!data.baseModelId) throw new BadRequestException('baseModelId is required');
    const model = await this.models.findOne({ where: { id: data.baseModelId } });
    const job = new TrainingJob();
    job.userId = userId;
    job.name = String(data.hyperparameters?.name ?? `${model?.name ?? data.baseModelId} fine-tune`);
    job.baseModelId = data.baseModelId;
    job.type = (data.hyperparameters?.type as TrainingJob['type']) ?? 'finetune';
    job.status = 'queued' as never;
    job.config = {
      ...(data.hyperparameters ?? {}),
      dataset_source: data.datasetSource ?? null,
    };
    return this.jobs.save(job);
  }

  async getJobs(userId: string, params: { page?: number; pageSize?: number; status?: TrainingStatus }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.jobs.createQueryBuilder('job').where('job.userId = :userId', { userId });
    if (params.status) qb.andWhere('job.status = :status', { status: params.status });
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { items, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async getJob(id: string) {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Training job not found');
    return job;
  }

  async cancelJob(id: string, userId: string) {
    const job = await this.jobs.findOne({ where: { id, userId } });
    if (!job) throw new NotFoundException('Training job not found');
    if (job.remoteJobId) {
      try {
        await this.aiProxy.cancelTrainingJob(job.remoteJobId);
      } catch {
        // remote job may already be finished
      }
    }
    this.stopPolling(job.id);
    job.status = 'cancelled' as never;
    job.completedAt = new Date();
    return this.jobs.save(job);
  }

  async startTraining(jobId: string) {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Training job not found');
    if (!['queued', 'failed', 'cancelled'].includes(job.status)) {
      throw new BadRequestException(`Job is ${job.status}`);
    }

    const model = job.baseModelId
      ? await this.models.findOne({ where: { id: job.baseModelId } })
      : null;
    if (!model?.repoId) throw new BadRequestException('Selected base model has no Hugging Face repo id');

    const config = job.config ?? {};
    const datasetSource = String(config.dataset_source ?? '').trim();
    if (!datasetSource) throw new BadRequestException('A dataset link (URL or HF dataset id) is required');

    // Datasets are materialised under the shared ./data mount inside /data.
    const datasetDir = `/data/datasets/${job.id}`;
    const payload = {
      name: job.name,
      base_model: model.repoId,
      train_dataset: `${datasetDir}/train.jsonl`,
      validation_dataset: `${datasetDir}/val.jsonl`,
      output_dir: '/output/adapters',
      dataset_source: datasetSource,
      dataset_adapter: String(config.dataset_adapter ?? 'chatml'),
      config: {
        method: config.method,
        epochs: config.epochs,
        batch_size: config.batch_size,
        eval_batch_size: config.eval_batch_size,
        learning_rate: config.learning_rate,
        max_seq_length: config.max_seq_length,
        seed: config.seed,
        lora_rank: config.lora_rank,
        lora_alpha: config.lora_alpha,
        lora_dropout: config.lora_dropout,
        packing: config.packing,
        val_ratio: config.val_ratio,
      },
    };

    const remoteJobId = await this.aiProxy.createTrainingJob(payload);

    job.remoteJobId = remoteJobId;
    job.status = 'preparing' as never;
    job.startedAt = new Date();
    await this.jobs.save(job);

    this.pollRemote(job.id);
    return job;
  }

  private pollRemote(jobId: string) {
    this.stopPolling(jobId);
    let failures = 0;
    const timer = setInterval(async () => {
      try {
        const job = await this.jobs.findOne({ where: { id: jobId } });
        if (!job || !job.remoteJobId || TERMINAL.has(job.status)) {
          this.stopPolling(jobId);
          return;
        }
        const remote = (await this.aiProxy.getTrainingJobStatus(job.remoteJobId)) as unknown as RemoteJobStatus;
        failures = 0;

        // Live progress reported by the trainer output capture.
        if (typeof remote.progress === 'number') job.progress = Math.round(remote.progress);
        if (typeof remote.current_step === 'number') job.currentStep = remote.current_step;
        if (typeof remote.total_steps === 'number') job.totalSteps = remote.total_steps;

        if (remote.status === 'completed') {
          this.stopPolling(jobId);
          job.status = 'completed' as never;
          job.progress = 100;
          job.completedAt = new Date();
          job.durationMs = job.startedAt ? job.completedAt.getTime() - job.startedAt.getTime() : 0;
          const adapterPath = remote.adapter_path ?? null;
          job.logs = [
            ...(job.logs ?? []),
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: adapterPath
                ? `Training finished — artefacts written to ${adapterPath}`
                : 'Training finished',
            },
          ];
          const trainLoss = Number(remote.final_metrics?.train_loss);
          if (Number.isFinite(trainLoss)) {
            job.metrics = [
              ...(job.metrics ?? []),
              {
                step: job.totalSteps || 1,
                loss: trainLoss,
                learningRate: Number(job.config?.learning_rate ?? 0),
                timestamp: new Date().toISOString(),
              },
            ];
          }
          await this.persistAdapter(job, adapterPath);
          await this.jobs.save(job);
          void this.notifications.create({
            userId: job.userId,
            type: 'training_completed',
            severity: 'success',
            title: `Training completed: ${job.name}`,
            message: 'Your fine-tuning job finished successfully.',
            actionUrl: `/training/jobs/${job.id}`,
            actionLabel: 'View job',
          });
          return;
        }

        if (remote.status === 'failed' || remote.status === 'cancelled') {
          this.stopPolling(jobId);
          job.status = remote.status as never;
          job.completedAt = new Date();
          await this.jobs.save(job);
          if (remote.status === 'failed') {
            void this.notifications.create({
              userId: job.userId,
              type: 'training_failed',
              severity: 'error',
              title: `Training failed: ${job.name}`,
              message: 'Your fine-tuning job failed. Check the runner logs for details.',
              actionUrl: `/training/jobs/${job.id}`,
              actionLabel: 'View job',
            });
          }
          return;
        }

        if (remote.status && remote.status !== job.status) {
          job.status = remote.status as never;
          await this.jobs.save(job);
        }
      } catch {
        // The remote store is in-memory: a training-service restart orphans
        // its jobs. Give up after ~2 minutes of consecutive failures.
        failures += 1;
        if (failures >= 40) {
          this.stopPolling(jobId);
          try {
            const job = await this.jobs.findOne({ where: { id: jobId } });
            if (job && !TERMINAL.has(job.status)) {
              job.status = 'failed' as never;
              job.logs = [
                ...(job.logs ?? []),
                {
                  timestamp: new Date().toISOString(),
                  level: 'error',
                  message: 'Lost contact with the training runner (service restarted?)',
                },
              ];
              job.completedAt = new Date();
              await this.jobs.save(job);
            }
          } catch {
            // ignore
          }
        }
      }
    }, 3000);
    timer.unref?.();
    this.pollers.set(jobId, timer);
  }

  private stopPolling(jobId: string) {
    const timer = this.pollers.get(jobId);
    if (timer) clearInterval(timer);
    this.pollers.delete(jobId);
  }

  private async persistAdapter(job: TrainingJob, adapterPath: string | null) {
    if (!adapterPath) return;
    const config = job.config ?? {};
    const method = String(config.method ?? 'qlora');
    // Only LoRA-family methods produce adapter weights; sft produces full models.
    if (!method.includes('lora')) return;
    const existing = await this.adapters.findOne({
      where: { name: `${job.name}-${job.id.slice(0, 8)}` },
    });
    if (existing) return;
    const adapter = this.adapters.create({
      userId: job.userId,
      name: `${job.name}-${job.id.slice(0, 8)}`,
      type: (method === 'qlora' ? 'qlora' : 'lora') as Adapter['type'],
      baseModelId: job.baseModelId,
      rank: Number(config.lora_rank ?? 16),
      alpha: Number(config.lora_alpha ?? 32),
      size: 0,
      description: `Adapter produced by job "${job.name}" — ${adapterPath}`,
    });
    await this.adapters.save(adapter);
    job.adapters = [
      ...(job.adapters ?? []),
      {
        id: adapter.id,
        name: adapter.name,
        size: adapter.size,
        baseModel: job.baseModelId ?? '',
        rank: adapter.rank,
        alpha: adapter.alpha,
      },
    ];
  }

  async getModels(userId: string) {
    return this.models.find({ where: { userId } });
  }

  async getAdapters(userId: string) {
    return this.adapters.find({ where: { userId } });
  }

  async deleteModel(id: string, userId: string) {
    const model = await this.models.findOne({ where: { id, userId } });
    if (!model) throw new NotFoundException('Model not found');
    await this.models.remove(model);
  }
}
