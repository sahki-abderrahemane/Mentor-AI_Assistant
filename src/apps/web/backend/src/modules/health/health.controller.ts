import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiProxyService } from '../../shared/ai-proxy/ai-proxy.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @InjectDataSource() private db: DataSource,
    private aiProxy: AiProxyService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.db.query('SELECT 1');
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.aiProxy.checkInference();
          return { aiInference: { status: 'up' } };
        } catch {
          return { aiInference: { status: 'down' } };
        }
      },
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.aiProxy.checkProcessing();
          return { aiProcessing: { status: 'up' } };
        } catch {
          return { aiProcessing: { status: 'down' } };
        }
      },
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.aiProxy.checkTraining();
          return { aiTraining: { status: 'up' } };
        } catch {
          return { aiTraining: { status: 'down' } };
        }
      },
    ]);
  }
}
