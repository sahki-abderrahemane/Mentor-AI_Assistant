import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { AiProxyModule } from '../../shared/ai-proxy/ai-proxy.module.js';

@Module({
  imports: [TerminusModule, AiProxyModule],
  controllers: [HealthController],
})
export class HealthModule {}
